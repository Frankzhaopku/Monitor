/**
 * Created by hzzhaoshengyu on 2016/8/26.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'RedisMonitor');
var async = require('async');

var RedisMonitor = function () {
  this.$id = "redisMonitor";
};

module.exports = RedisMonitor;