/**
 * Created by hzzhaoshengyu on 2016/8/30.
 */

var bearcat = require('bearcat');
var logger = require('pomelo-logger').getLogger('san-monitor', 'utils');

var Utils = function () {
  this.$id = "utils";
};

Utils.prototype.verifyServerInfo = function (serverInfo) {
  if (serverInfo['remote']) {
    return (
      serverInfo &&
      serverInfo.hasOwnProperty('addr') &&
      serverInfo.hasOwnProperty('port') &&
      serverInfo.hasOwnProperty('user') &&
      serverInfo.hasOwnProperty('name') &&
      serverInfo.hasOwnProperty('enable')
    );
  } else {
    return true;
  }
};

Utils.prototype.floatToPercent = function (f) {
  return Math.floor(f * 10000) / 100;
};

Utils.prototype.format = function (args) {
  var str = this;
  var regex = new RegExp("{-?[0-9]+}", "g");
  return str.replace(regex, function (item) {
    var intVal = parseInt(item.substring(1, item.length - 1));
    var replace;
    if (intVal >= 0) {
      replace = args[intVal];
    } else if (intVal === -1) {
      replace = "{";
    } else if (intVal === -2) {
      replace = "}";
    } else {
      replace = "";
    }
    return replace;
  });
};

module.exports = Utils;
