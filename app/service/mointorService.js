/**
 * Created by hzzhaoshengyu on 2016/8/29.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'monitorService');
var exec = require('child_process').exec;

var MonitorService = function () {
  this.$id = 'monitorService';
  this.$init = 'init';
  this.cpuInfoDesc = [
    'cpu_name', 'user', 'nice', 'system', 'idle', 'iowait', 'irq', 'softirq', 'stealstolen', 'guest'
  ];
};

MonitorService.prototype.init = function () {
};

MonitorService.prototype.getCPUInfo = function () {
  exec('cat /proc/cpu', function (err, stdout, stderr) {
    if (err) logger.error(err);
    if (stderr) logger.error(stderr);
    logger.info(stdout);
  });
};

module.exports = MonitorService;