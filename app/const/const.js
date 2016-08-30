/**
 * Created by hzzhaoshengyu on 2016/8/30.
 */

var Const = function () {
  this.$id = 'const';
  this.CPU_USAGE_METRIC_PREFIX = "cpu.";
  this.MEM_FREE_METRIC_PREFIX = 'mem.free.';
  this.MEM_USAGE_METRIC_PREFIX = 'mem.usage.';
  this.DISK_USAGE_METRIC_PREFIX = 'disk.usage.';
  this.DISK_FREE_METRIC_PREFIX = 'disk.free.';
  this.DISK_READ_COUNT_METRIC_PREFIX = 'disk.read.count.';
  this.DISK_WRITE_COUNT_METRIC_PREFIX = 'disk.write.count.';
  this.DISK_IO_COUNT_METRIC_PREFIX = 'disk.io.count.';
  this.GAME_MONITOR_INTERVAL = 5000;
};

module.exports = Const;