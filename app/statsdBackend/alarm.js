/**
 * Created by hzzhaoshengyu on 2016/9/1.
 */

var extend = require('util')._extend;

var monitorItems = {
  gauges: [
    // game server
    'cpu.game-server-machine',
    'mem.free.game-server-machine',
    // udp server
    'cpu.udp-server',
    'rss.udp-server',
    // redis
    'redis.uptime.redis-server',
    'redis.connected.clients.redis-server',
    'redis.rejected.connections.redis-server',
    'redis.miss.rate.redis-server'
  ],
  counters: [],
  timers: [],
  sets: []
};

var emptyRecvData = {
  gauges: {},
  counters: {},
  timers: {},
  sets: {}
};

var alarmThreshold = {
  
  gauges: {
    "cpu.game-server-machine-1" : {
      method: 'gt',
      change: false,
      value: 50
    },
    'mem.free.game-server-machine-1': {
      method: 'lt',
      change: false,
      value: 20 * 1024 * 1024
    }
  }

};

var lastRecvData = null;

var gt = function (a, b) {
  return a > b;
};

var lt = function (a, b) {
  return a < b;
};

var alarmFlush = function dataReceive (ts, metrics) {
  var recvData = extend(emptyRecvData, {});

  Object.keys(monitorItems).forEach(function (type) {
    if (!metrics.hasOwnProperty(type)) return;
    monitorItems[type].forEach(function (item) {
      Object.keys(metrics[type]).forEach(function (metric) {
        if (metric.indexOf(item) !== -1) {
          recvData[type][metric] = metrics[type][metric];
        }
      });
    });
  });

  console.log(JSON.stringify(recvData));
  
  if (lastRecvData === null) {
    lastRecvData = recvData;
    return;
  }

  Object.keys(alarmThreshold).forEach(function (type) {
    if (!recvData.hasOwnProperty(type)) return;
    Object.keys(alarmThreshold[type]).forEach(function (metric) {
      if (!recvData[type].hasOwnProperty(metric)) return;
      var value;
      if (alarmThreshold[type][metric].change) {
        value = recvData[type][metric] - lastRecvData[type][metric];
      } else {
        value = recvData[type][metric];
      }
      if (alarmThreshold[type][metric][method](value, alarmThreshold[type][metric].value)) {
        console.log('alarm!');
      }
    });
  });

};

exports.init = function (startupTime, config, events) {
  events.on('flush', alarmFlush);
  events.on('status', function () {console.log(JSON.stringify(status));});
  return true;
};
