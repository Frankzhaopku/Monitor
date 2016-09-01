/**
 * Created by hzzhaoshengyu on 2016/8/26.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'RedisMonitor');
var async = require('async');

var RedisMonitor = function () {
  this.$id = "redisMonitor";
  this.$monitorService = null;
  this.$configService = null;
  this.$statsDClient = null;
  this.$const = null;
  this.$utils = null;
};

RedisMonitor.prototype.start = function () {
  var self = this;
  var callback = function () {
    self.$utils.processResult.apply(self, arguments);
  };
  var runMonitor = function () {
    self.$monitorService.getRedisInfo(callback);
  };
  setInterval(runMonitor, self.$const.REDIS_MONITOR_INTERVAL);
};

module.exports = RedisMonitor;