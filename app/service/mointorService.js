/**
 * Created by hzzhaoshengyu on 2016/8/29.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'monitorService');
var exec = require('child_process').exec;

var MonitorService = function () {
  this.$id = 'monitorService';
  this.$init = 'init';

  this.$configService = null;
  this.$const = null;
  this.$utils = null;

  this.redis = null;
  this.redisClients = null;

  this.cpuInfoDesc = [
    'cpu_name', 'user', 'nice', 'system', 'idle', 'iowait', 'irq', 'softirq', 'stealstolen', 'guest'
  ];
  this.diskUsageDesc = [
    'disk_name', 'total', 'used', 'free', 'usage'
  ];
  this.diskIODesc = [
    'mainId', 'secondId', 'name',
    'read', 'readMerged', 'readSector', 'readTime',
    'write', 'writeMerged', 'writeSector', 'writeTime',
    'IOCount', 'IOTime', 'IOWeightTime'
  ];
  this.networkDesc = [
    'in', 'out'
  ];
  this.psDesc = [
    'user', 'pid', 'cpu', 'mem', 'vsz', 'rss', 'tty', 'stat', 'start', 'time', 'command', 'arg1', 'arg2', 'arg3'
  ];
  this.redisMonitorItem = [
    'uptime_in_seconds', 'connected_clients', 'rejected_connections', 'blocked_clients', // client and connections
    'used_memory', // memory
    'keyspace_misses',  // key hit status
    'total_commands_processed', // command
    'total_net_input_bytes', 'total_net_output_bytes' // network
  ];

  this.lastCpuInfo = null;
  this.lastDiskIOInfo = null;
  this.lastRedisInfo = null;
};

MonitorService.prototype.init = function () {
  // establish redis clients
  var self = this;
  self.redis = require('redis');
  var redisServers = self.$configService.redisConfig['servers'];
  self.redisClients = {};
  redisServers.forEach(function (serverInfo) {
    if (serverInfo['enable']) {
      self.redisClients[serverInfo['name']] = self.redis.createClient({
        host: serverInfo['addr'],
        port: serverInfo['port']
      });
    }
  });
};

MonitorService.prototype.getCpuInfo = function (serverInfo, cb) {
  var self = this;
  var cmd = "";
  // format running shell command based on serverInfo
  if (serverInfo) {
    cmd = self.$utils.format.apply('ssh {0} -p {1} -l {2} "cat /proc/stat"',
      [[serverInfo['addr'], serverInfo['port'], serverInfo['user']]]);
  } else {
    cmd = "cat /proc/stat";
  }
  // run the command to get cpu info and cal the use rate
  exec(cmd, function (err, stdout, stderr) {
    if (err) return cb(err);
    if (stderr) return cb(stderr);

    // process standard output
    if (!stdout) return cb();
    var cpuInfo = self.$utils.assginFetchInfo(self.cpuInfoDesc, stdout);
    cpuInfo['total'] = 0;
    self.cpuInfoDesc.forEach(function (desc, index) {
      if (index != 0) { // skip cpu name
        cpuInfo[desc] = parseInt(cpuInfo[desc]);
        cpuInfo['total'] += cpuInfo[desc];
      }
    });

    // restore the cpu info for next round calculation
    if (!self.lastCpuInfo) {
      self.lastCpuInfo = {};
      self.lastCpuInfo[serverInfo['name']] = cpuInfo;
      return cb();
    }
    if (!self.lastCpuInfo[serverInfo['name']]) {
      self.lastCpuInfo[serverInfo['name']] = cpuInfo;
      return cb();
    }
    var lastCpuInfo = self.lastCpuInfo[serverInfo['name']];
    // calculate the use rate
    var useRate = self.$utils.floatToPercent(1 - (cpuInfo['idle'] -
        lastCpuInfo['idle']) / (cpuInfo['total'] - lastCpuInfo['total']));
    var metric = self.$const.CPU_USAGE_METRIC_PREFIX + serverInfo['name'];
    self.lastCpuInfo[serverInfo['name']] = cpuInfo;
    cb(null, [{metric: metric, value: useRate, method: 'gauge'}]);
  });
};

MonitorService.prototype.getMemInfo = function (serverInfo, cb) {
  var self = this;
  var cmd = "";
  // format running shell command based on serverInfo
  if (serverInfo['remote']) {
    cmd = self.$utils.format.apply('ssh {0} -p {1} -l {2} "cat /proc/meminfo"',
      [[serverInfo['addr'], serverInfo['port'], serverInfo['user']]]);
  } else {
    cmd = "cat /proc/meminfo";
  }
  // run the command to get cpu info and cal the use rate
  exec(cmd, function (err, stdout, stderr) {
    if (err) return cb(err);
    if (stderr) return cb(stderr);

    // process standard output
    var lines = stdout.toString().split("\n");
    var memTotal = lines[0].split(/\s+/)[1];
    var memFree = parseInt(lines[1].split(/\s+/)[1]);
    var memUsage = self.$utils.floatToPercent(1 - memFree / memTotal);

    cb(null, [{
      metric: self.$const.MEM_FREE_METRIC_PREFIX + serverInfo['name'], value: memFree, method: 'gauge'
    }, {
      metric: self.$const.MEM_USAGE_METRIC_PREFIX + serverInfo['name'], value: memUsage, method: 'gauge'
    }]);
  });
};

MonitorService.prototype.getDiskInfo = function (serverInfo, cb) {
  var self = this;
  var cmdArr = [];
  var diskInfo = serverInfo['disk'];

  // Get usage first
  if (serverInfo['remote']) {
    diskInfo['usageId'].forEach(function (id, index) {
      cmdArr[index] = self.$utils.format.apply('ssh {0} -p {1} -l {2} "df | grep -w {3}"',
        [[serverInfo['addr'], serverInfo['port'], serverInfo['user'], id]]);
    });
  } else {
    diskInfo['usageId'].forEach(function (id) {
      cmdArr[index] = self.$utils.format.apply("df | grep -w {0}", [[id]]);
    });
  }
  // run commands
  cmdArr.forEach(function (cmd, index) {
    exec(cmd, function (err, stdout, stderr) {
      if (err) return cb(err);
      if (stderr) return cb(stderr);

      // process standard output
      if (!stdout) return cb();
      var diskUsageInfo = self.$utils.assginFetchInfo(self.diskUsageDesc, stdout);
      var diskFree = parseInt(diskUsageInfo['free']);
      var diskUsage = parseInt(diskUsageInfo['usage'].substr(0, diskUsageInfo['usage'].length - 1));

      cb(null, [{
        metric: self.$const.DISK_FREE_METRIC_PREFIX + serverInfo['name'] + "." + serverInfo['disk']['usageId'][index],
        value: diskFree,
        method: 'gauge'
      }, {
        metric: self.$const.DISK_USAGE_METRIC_PREFIX + serverInfo['name'] + "." + serverInfo['disk']['usageId'][index],
        value: diskUsage,
        method: 'gauge'
      }]);
    });
  });

  // Get IO data next
  cmdArr = [];
  if (serverInfo['remote']) {
    diskInfo['IOId'].forEach(function (id, index) {
      cmdArr[index] = self.$utils.format.apply('ssh {0} -p {1} -l {2} "cat /proc/diskstats | grep -w {3}"',
        [[serverInfo['addr'], serverInfo['port'], serverInfo['user'], id]]);
    });
  } else {
    diskInfo['IOId'].forEach(function (id, index) {
      cmdArr[index] = self.$utils.format.apply("cat /proc/diskstats | grep -w {0}", [[id]]);
    });
  }
  // run commands
  cmdArr.forEach(function (cmd, index) {
    exec(cmd, function (err, stdout, stderr) {
      if (err) return cb(err);
      if (stderr) return cb(stderr);

      // process standard output
      if (!stdout) return cb();
      var id = diskInfo['IOId'][index];
      var diskIOInfo = self.$utils.assginFetchInfo(self.diskIODesc, stdout);
      if (!self.lastDiskIOInfo) {
        self.lastDiskIOInfo = {};
        self.lastDiskIOInfo[serverInfo['name']] = {
          id: diskIOInfo
        };
        return cb();
      }
      if (!self.lastDiskIOInfo[serverInfo['name']][id]) {
        self.lastDiskIOInfo[serverInfo['name']][id] = diskIOInfo;
        return cb();
      }

      var lastDiskIOInfo = self.lastDiskIOInfo[serverInfo['name']][id];
      var diskReadCount = diskIOInfo['read'] - lastDiskIOInfo['read'];
      var diskWriteCount = diskIOInfo['write'] - lastDiskIOInfo['write'];
      var diskIOCount = parseInt(diskIOInfo['IOCount']);
      self.lastDiskIOInfo[serverInfo['name']][id] = diskIOInfo;
      cb(null, [{
        metric: self.$const.DISK_READ_COUNT_METRIC_PREFIX + serverInfo['name'] + "." + serverInfo['disk']['IOId'][index],
        value: diskReadCount,
        method: 'gauge'
      }, {
        metric: self.$const.DISK_WRITE_COUNT_METRIC_PREFIX + serverInfo['name'] + "." + serverInfo['disk']['IOId'][index],
        value: diskWriteCount,
        method: 'gauge'
      }, {
        metric: self.$const.DISK_IO_COUNT_METRIC_PREFIX + serverInfo['name'] + "." + serverInfo['disk']['IOId'][index],
        value: diskIOCount,
        method: 'gauge'
      }]);
    });
  });
};

MonitorService.prototype.getNetworkInfo = function (serverInfo, cb) {
  var self = this;
  var cmdArr = [];
  var netInfo = serverInfo['net'];

  // Get usage first
  if (serverInfo['remote']) {
    netInfo['device'].forEach(function (device, index) {
      cmdArr[index] = self.$utils.format.apply('ssh {0} -p {1} -l {2} "ifstat -i {3} 0.1 1"',
        [[serverInfo['addr'], serverInfo['port'], serverInfo['user'], device]]);
    });
  } else {
    netInfo['device'].forEach(function (device) {
      cmdArr[index] = self.$utils.format.apply("ifstat -i {0} 0.1 1", [[device]]);
    });
  }
  // run commands
  cmdArr.forEach(function (cmd, index) {
    exec(cmd, function (err, stdout, stderr) {
      if (err) return cb(err);
      if (stderr) return cb(stderr);

      // process standard output
      if (!stdout) return cb();
      var line = stdout.split('\n')[2];
      var networkInfo = self.$utils.assginFetchInfo(self.networkDesc, line);

      cb(null, [{
        metric: self.$const.NET_IN_METRIC_PREFIX + serverInfo['name'] + "." + serverInfo['net']['device'][index],
        value: parseFloat(networkInfo['in']),
        method: 'gauge'
      }, {
        metric: self.$const.NET_OUT_METRIC_PREFIX + serverInfo['name'] + "." + serverInfo['net']['device'][index],
        value: parseFloat(networkInfo['out']),
        method: 'gauge'
      }]);
    });
  });
};

MonitorService.prototype.getUdpInfo = function (serverInfo, cb) {
  var self = this;
  var cmd = "";

  // Get usage first
  if (serverInfo['remote']) {
    cmd = self.$utils.format.apply('ssh {0} -p {1} -l {2} "ps aux | grep {3} | grep -v grep | grep -v ^$"',
      [[serverInfo['addr'], serverInfo['port'], serverInfo['user'], serverInfo['keyword']]]);
  } else {
    cmd = self.$utils.format.apply("ps aux | grep {0} | grep -v grep | grep -v ^$", [[serverInfo['keyword']]]);
  }
  // run commands
  exec(cmd, function (err, stdout, stderr) {
    if (err) return cb(err);
    if (stderr) return cb(stderr);

    // process standard output
    if (!stdout) return cb();
    var lines = stdout.split('\n');
    lines.forEach(function (line) {
      var udpInfo = self.$utils.assginFetchInfo(self.psDesc, line);
      if (udpInfo === null) {
        return cb();
      }
      cb(null, [{
        metric: self.$const.CPU_USAGE_METRIC_PREFIX + udpInfo['arg3'],
        value: parseFloat(udpInfo['cpu']),
        method: 'gauge'
      }, {
        metric: self.$const.MEM_USAGE_METRIC_PREFIX + udpInfo['arg3'],
        value: parseFloat(udpInfo['mem']),
        method: 'gauge'
      }, {
        metric: self.$const.RSS_METRIC_PREFIX + udpInfo['arg3'],
        value: parseFloat(udpInfo['rss']),
        method: 'gauge'
      }, {
        metric: self.$const.VSZ_METRIC_PREFIX + udpInfo['arg3'],
        value: parseFloat(udpInfo['vsz']),
        method: 'gauge'
      }]);
    });
  });
};

MonitorService.prototype.getRedisInfo = function (cb) {
  var self = this;
  var clients = self.redisClients;
  for (var serverName in clients) {
    if (clients.hasOwnProperty(serverName)) {
      var client = clients[serverName];
      if (!client.ready) return cb();
      client.info();
      var serverInfo = client.server_info;
      var redisInfo = {};
      self.redisMonitorItem.forEach(function (item) {
        redisInfo[item] = serverInfo[item];
      });
      if (!self.lastRedisInfo) {
        self.lastRedisInfo = {};
        self.lastRedisInfo[serverName] = redisInfo;
        return cb();
      }
      if (!self.lastRedisInfo[serverName]) {
        return self.lastRedisInfo[serverName] = redisInfo;
      }

      var lastRedisInfo = self.lastRedisInfo[serverName];
      var data = {
        uptime: parseInt(redisInfo['uptime_in_seconds']),
        connectedClients: parseInt(redisInfo['connected_clients']),
        rejectedClients: parseInt(redisInfo['rejected_connections']),
        blockedClients: parseInt(redisInfo['blocked_clients']),
        memUse: parseInt(redisInfo['used_memory']),
        keyMiss: parseInt(redisInfo['keyspace_misses']) - parseInt(lastRedisInfo['keyspace_misses']),
        cmdProc: parseInt(redisInfo['total_commands_processed']) - parseInt(lastRedisInfo['total_commands_processed']),
        netIn: parseInt(redisInfo['total_net_input_bytes']) - parseInt(lastRedisInfo['total_net_input_bytes']),
        netOut: parseInt(redisInfo['total_net_output_bytes']) - parseInt(lastRedisInfo['total_net_output_bytes'])
      };
      data['missRate'] = self.$utils.floatToPercent(data.keyMiss / data.cmdProc);
      self.lastRedisInfo[serverName] = redisInfo;

      cb(null, [{
        metric: self.$const.REDIS_UPTIME_METRIC_PREFIX + serverName,
        value: data.uptime,
        method: 'gauge'
      }, {
        metric: self.$const.REDIS_CONNECTED_CLIENS_METRIC_PREFIX + serverName,
        value: data.connectedClients,
        method: 'gauge'
      }, {
        metric: self.$const.REDIS_REJECTED_CONNECTION_METRIC_PREFIX + serverName,
        value: data.rejectedClients,
        method: 'gauge'
      }, {
        metric: self.$const.REDIS_BLOCKED_CLIENTS_METRIC_PREFIX + serverName,
        value: data.blockedClients,
        method: 'gauge'
      }, {
        metric: self.$const.REDIS_MEM_USE_METRIC_PREFIX + serverName,
        value: data.memUse,
        method: 'gauge'
      }, {
        metric: self.$const.REDIS_KEY_MISS_METRIC_PREFIX + serverName,
        value: data.keyMiss,
        method: 'gauge'
      }, {
        metric: self.$const.REDIS_MISS_RATE_METRIC_PREFIX + serverName,
        value: data.missRate,
        method: 'gauge'
      }, {
        metric: self.$const.REDIS_CMD_PROC_METRIC_PREFIC + serverName,
        value: data.cmdProc,
        method: 'gauge'
      }, {
        metric: self.$const.REDIS_NET_IN_METRIC_PREFIX + serverName,
        value: data.netIn,
        method: 'gauge'
      }, {
        metric: self.$const.REDIS_NET_OUT_METRIC_PREFIX + serverName,
        value: data.netOut,
        method: 'gauge'
      }]);
    }
  }
};

module.exports = MonitorService;
