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
  this.udpConfig = require(loadPath + 'udp.json');
};

module.exports = ConfigService;
