/**
 * Created by hzzhaoshengyu on 2016/8/30.
 */

var Const = function () {
  this.$id = 'const';
  this.CPU_USAGE_METRIC_PREFIX = "cpu.";

  this.MEM_FREE_METRIC_PREFIX = 'mem.free.';
  this.MEM_USAGE_METRIC_PREFIX = 'mem.usage.';

  this.RSS_METRIC_PREFIX = 'rss.';
  this.VSZ_METRIC_PREFIX = 'vsz.';

  this.DISK_USAGE_METRIC_PREFIX = 'disk.usage.';
  this.DISK_FREE_METRIC_PREFIX = 'disk.free.';
  this.DISK_READ_COUNT_METRIC_PREFIX = 'disk.read.count.';
  this.DISK_WRITE_COUNT_METRIC_PREFIX = 'disk.write.count.';
  this.DISK_IO_COUNT_METRIC_PREFIX = 'disk.io.count.';

  this.NET_IN_METRIC_PREFIX = 'net.in.';
  this.NET_OUT_METRIC_PREFIX = 'net.out.';

  this.REDIS_UPTIME_METRIC_PREFIX = 'redis.uptime.';
  this.REDIS_CONNECTED_CLIENS_METRIC_PREFIX = 'redis.connected.clients.';
  this.REDIS_REJECTED_CONNECTION_METRIC_PREFIX = 'redis.rejected.connection.';
  this.REDIS_BLOCKED_CLIENTS_METRIC_PREFIX = 'redis.blocked.clients.';
  this.REDIS_MEM_USE_METRIC_PREFIX = 'redis.mem.use.';
  this.REDIS_KEY_MISS_METRIC_PREFIX = 'redis.key.miss.';
  this.REDIS_CMD_PROC_METRIC_PREFIC = 'redis.command.processes.';
  this.REDIS_NET_IN_METRIC_PREFIX = 'redis.net.in.';
  this.REDIS_NET_OUT_METRIC_PREFIX = 'redis.net.out.';
  this.REDIS_MISS_RATE_METRIC_PREFIX = 'redis.miss.rate.';

  this.GAME_MONITOR_INTERVAL = 5000;
  this.UDP_MONITOR_INTERVAL = 5000;
  this.REDIS_MONITOR_INTERVAL = 1000;
};

module.exports = Const;
