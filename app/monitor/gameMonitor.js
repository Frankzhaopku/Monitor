/**
 * Created by hzzhaoshengyu on 2016/8/26.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'gameMonitor');

var GameMonitor = function () {
  this.$id = "gameMonitor";
  this.$init = "init";
  this.$monitorService = null;
  this.$configService = null;
  this.$statsDClient = null;
  this.$const = null;
  this.$utils = null;
};

GameMonitor.prototype.init = function () {

};

GameMonitor.prototype.start = function () {
  var self = this;
  var monitorService = self.$monitorService;
  //
  var callback = function () {
    self.$utils.processResult.apply(self, arguments);
  };
  // periodically running function
  var runMonitor = function () {
    var servers = self.$configService.gameConfig['servers'] || [];
    servers.forEach(function (serverInfo, index) {
      if (!self.$utils.verifyServerInfo(serverInfo)) {
        logger.warn("Game server " + index + " info invalid.");
      } else if (serverInfo['enable']) {
        if (serverInfo['cpu']['enable']) {
          // get cpu info
          monitorService.getCpuInfo(serverInfo, callback);
        }
        if (serverInfo['mem']['enable']) {
          // get mem info
          monitorService.getMemInfo(serverInfo, callback);
        }
        // get disk info
        if (serverInfo['disk']['enable']) {
          monitorService.getDiskInfo(serverInfo, callback);
        }
        // get network device info
        if (serverInfo['net']['enable']) {
          monitorService.getNetworkInfo(serverInfo, callback);
        }
      }
    });
  };

  setInterval(runMonitor, this.$const.GAME_MONITOR_INTERVAL);
};

module.exports = GameMonitor;