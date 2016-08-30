/**
 * Created by hzzhaoshengyu on 2016/8/30.
 */

var logger = require('pomelo-logger').getLogger('san-monitor', 'StatsDClient');

var StatsDClient = function () {
  this.$id = "statsDClient";
  this.$init = "init";
  this.$configService = null;
  this.test = "test";
  this.client = "client";
};

StatsDClient.prototype.init = function () {
  var StatsD = require('node-statsd');
  this.client = new StatsD(this.$configService.statsdConfig);
};

StatsDClient.prototype.sendData = function (dataArr) {
  var client = this.client;
  dataArr.forEach(function (data) {
    if (!(data.hasOwnProperty('method') && data.hasOwnProperty('metric') && data.hasOwnProperty('value'))) return;
    if (!(client[data.method] && typeof client[data.method] === 'function')) return;
    logger.info("Start send data: " + JSON.stringify(data));
    client[data.method](data.metric, data.value);
  });
};

module.exports = StatsDClient;
