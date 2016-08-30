/**
 * Created by hzzhaoshengyu on 2016/8/28.
 */

var bearcat = require('bearcat');
var fs = require('fs');
var logger = require('pomelo-logger').getLogger('san-monitor', 'configService');

var ConfigService = function () {
  this.$id = "configService";
  this.loadPath = process.cwd() + '/config/' + bearcat.getApplicationContext().getEnv() + '/';
  this.gameConfig = require(this.loadPath + 'game.json');
  this.redisConfig = require(this.loadPath + 'redis.json');
  this.udpConfig = require(this.loadPath + 'udp.json');
  this.statsdConfig = require(this.loadPath + 'statsd.json');
};

ConfigService.prototype.init = function () {
};

module.exports = ConfigService;
