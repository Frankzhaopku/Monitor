/**
 * Created by hzzhaoshengyu on 2016/8/26.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'UdpMonitor');
var async = require('async');

var UdpMonitor = function () {
  this.$id = "udpMonitor";
};

module.exports = UdpMonitor;