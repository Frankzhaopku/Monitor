/**
 * Created by hzzhaoshengyu on 2016/8/26.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'RedisMonitor');
var async = require('async');

var RedisMonitor = function() {
    this.$id = "RedisMonitor";
};

RedisMonitor.prototype.test = function () {
    logger.info("redis test");
};

module.exports = RedisMonitor;