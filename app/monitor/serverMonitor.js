/**
 * Created by hzzhaoshengyu on 2016/8/26.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'ServerMonitor');
var async = require('async');

var ServerMonitor = function() {
    this.$id = "ServerMonitor";
};

ServerMonitor.prototype.test = function () {
    logger.info("server test");
};

module.exports = ServerMonitor;