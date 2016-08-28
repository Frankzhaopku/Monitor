/**
 * Created by hzzhaoshengyu on 2016/8/26.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'gameMonitor');
var async = require('async');
var process = require('child_process');

var GameMonitor = function () {
  this.$id = "gameMonitor";
  this.$init = "init";
  this.$configService = null;
  this.servers = null;
};

GameMonitor.prototype.test = function () {
  var servers = this.servers;
  servers.map(function (server) {
    logger.info("Server: " + server['addr'] + ", port: " + server['port'] + ", user: " + server['user']);
    var cmd = "ssh " + server['addr'] + ' -p ' + server['port'] + ' -l ' + server['user'] + ' | mpstat';
    process.exec(cmd, function (err, stdout, stderr) {
      if (err) return logger.error(err);
      if (stderr) return logger.error(stderr);
      return logger.debug(stdout);
    });
  });
};

GameMonitor.prototype.init = function () {
  this.servers = this.$configService.gameConfig.servers;
};

module.exports = GameMonitor;