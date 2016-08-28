/**
 * Created by hzzhaoshengyu on 2016/8/28.
 */

var bearcat = require('bearcat');
var fs = require('fs');
var logger = require('pomelo-logger').getLogger('san-monitor', 'configService');

var ConfigService = function () {
  this.$id = "configService";
  this.$init = "init";
  this.gameConfig = null;
  this.redisConfig = null;
  this.udpConfig = null;
};

ConfigService.prototype.init = function () {
  var loadPath = process.cwd() + '/config/' + bearcat.getApplicationContext().getEnv() + '/';
  this.gameConfig = require(loadPath + 'game.json');
  this.redisConfig = require(loadPath + 'redis.json');
  /*
  var configPath = process.cwd() + '/config/';
  fs.readdir(configPath, function (err, files) {
    files.map(function (file) {
      fs.stat(configPath + file, function (err, stat) {
        if (err) {
          logger.error(err);
          return;
        }
        if (stat.isDirectory() && file === bearcat.getApplicationContext().getEnv()) {
          fs.readdir(configPath + file + "/", function (err, configFiles) {
            configFiles.map(function (f) {
              this[f.slice(0, f.indexOf(".json")) + 'Config'] = require(configPath + file + "/" + f);
            });
          });
        }
      });
    });
  });
  */
};

module.exports = ConfigService;
