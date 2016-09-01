/**
 * Created by hzzhaoshengyu on 2016/9/1.
 */

var extend = require('util')._extend;

var monitorItem = {
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
    cpu.game-server-machine : {
      method: 'gt',
      change: false,
      value: 50
    }
  }

};

var lastRecvData = null;

var alarmFlush = function dataReceive (ts, metrics) {
  var recvData = extend(emptyRecvData, {});
  for (var type in monitorItem) {
    if (monitorItem.hasOwnProperty(type)) {
      if (!metrics.hasOwnProperty(type)) return;
      monitorItem[type].forEach(function (item) {
        for (var metric in metrics[type]) {
          if (!metrics[type].hasOwnProperty(metric)) return;
          if (metric.indexOf(item) !== -1) {
            recvData[type][metric] = metrics[type][metric];
          }
        }
      });
    }
  }
  console.log(JSON.stringify(recvData));
  
  if (lastRecvData === null) {
    lastRecvData = recvData;
    return;
  }

  for (var type in alarmThreshold) {
    
  }

};

exports.init = function (startupTime, config, events) {
  events.on('flush', alarmFlush);
  events.on('status', function () {console.log(JSON.stringify(status));});
  return true;
};
