/**
 * Created by hzzhaoshengyu on 2016/8/26.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'gameMonitor');
var async = require('async');
var process = require('child_process');

var GameMonitor = function () {
  this.$id = "gameMonitor";
  this.$init = "init";
  this.$monitorService = null;
};

GameMonitor.prototype.init = function () {

};

GameMonitor.prototype.test = function () {
  setInterval(this.$monitorService.getCPUInfo, 1000);
};

module.exports = GameMonitor;