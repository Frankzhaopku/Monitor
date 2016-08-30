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
    self.processResult.apply(self, arguments);
  };
  // periodically running function
  var runMonitor = function () {
    var servers = self.$configService.gameConfig['servers'] || [];
    servers.forEach(function (serverInfo, index) {
      if (!self.$utils.verifyServerInfo(serverInfo)) {
        logger.warn("Game server " + index + " info invalid.");
      } else if (serverInfo['enable']) {
        // get cpu info
        monitorService.getCpuInfo(serverInfo, callback);
        // get mem info
        monitorService.getMemInfo(serverInfo, callback);
        // get disk info
        monitorService.getDiskInfo(serverInfo, callback);
      }
    });
  };

  setInterval(runMonitor, this.$const.GAME_MONITOR_INTERVAL);
};

// process monitor result, send metric to statsd
GameMonitor.prototype.processResult = function (err, res) {
  if (err) {
    return logger.error(err);
  }
  if (res) {
    this.$statsDClient.sendData(res);
  }
};

module.exports = GameMonitor;