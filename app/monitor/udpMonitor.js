/**
 * Created by hzzhaoshengyu on 2016/8/26.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'UdpMonitor');

var UdpMonitor = function () {
  this.$id = "udpMonitor";
  this.$monitorService = null;
  this.$configService = null;
  this.$const = null;
  this.$utils = null;
};

UdpMonitor.prototype.start = function () {
  var self = this;
  var callback = function () {
    self.$utils.processResult.apply(self, arguments);
  };
  // periodically running function
  var runMonitor = function () {
    var servers = self.$configService.udpConfig['servers'] || [];
    servers.forEach(function (serverInfo, index) {
      if (!self.$utils.verifyServerInfo(serverInfo)) {
        logger.warn("Game server " + index + " info invalid.");
      } else if (serverInfo['enable']) {
        self.$monitorService.getUdpInfo(serverInfo, callback);
      }
    });
  };

  setInterval(runMonitor, this.$const.UDP_MONITOR_INTERVAL);
};

module.exports = UdpMonitor;
