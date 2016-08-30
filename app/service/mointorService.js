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

  this.lastCpuInfo = null;
  this.lastDiskIOInfo = null;
};

MonitorService.prototype.init = function () {
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
    var lines = stdout.toString().split("\n");
    var infoStr = lines[0].split(/\s+/);
    var cpuInfo = {
      total: 0
    };
    var cpuInfoDesc = self.cpuInfoDesc;
    cpuInfoDesc.forEach(function(desc, index) {
      if(index != 0) {  // skip cpu_name
        cpuInfo[cpuInfoDesc[index]] = infoStr[index];
        cpuInfo.total += parseInt(infoStr[index]);
      }
    });

    // restore the cpu info for next round calculation
    if (!self.lastCpuInfo) {
      self.lastCpuInfo = cpuInfo;
      cb();
    } else {  // calculate the use rate
      var useRate = self.$utils.floatToPercent(1 - (cpuInfo['idle'] -
          self.lastCpuInfo['idle']) / (cpuInfo['total'] - self.lastCpuInfo['total']));
      var metric = self.$const.CPU_USAGE_METRIC_PREFIX + serverInfo['name'];
      self.lastCpuInfo = cpuInfo;
      cb(null, [{metric: metric, value: useRate, method: 'gauge'}]);
    }
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
      var line = stdout;
      if (!line) return;
      line.trim();
      line = line.split(/\s+/);
      var diskUsageInfo = {};
      var diskUsageDesc = self.diskUsageDesc;
      diskUsageDesc.forEach(function(desc, index) {
        if(index != 0) {  // skip cpu_name
          diskUsageInfo[diskUsageDesc[index]] = line[index];
        }
      });
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
    diskInfo['IOId'].forEach(function (id) {
      cmdArr[index] = self.$utils.format.apply("cat /proc/diskstats | grep -w {0}", [[id]]);
    });
  }
  // run commands
  cmdArr.forEach(function (cmd, index) {
    exec(cmd, function (err, stdout, stderr) {
      if (err) return cb(err);
      if (stderr) return cb(stderr);

      // process standard output
      var line = stdout;
      if (!line) return;
      line.trim();
      line = line.split(/\s+/);
      var diskIOInfo = {};
      var diskIODesc = self.diskIODesc;
      diskIODesc.forEach(function(desc, index) {
          diskIOInfo[diskIODesc[index]] = line[index + 1];
      });
      if (!self.lastDiskIOInfo) {
        self.lastDiskIOInfo = diskIOInfo;
        return;
      }

      var diskReadCount = diskIOInfo['read'] - self.lastDiskIOInfo['read'];
      var diskWriteCount = diskIOInfo['write'] - self.lastDiskIOInfo['write'];
      var diskIOCount = parseInt(diskIOInfo['IOCount']);
      self.lastDiskIOInfo = diskIOInfo;
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

module.exports = MonitorService;