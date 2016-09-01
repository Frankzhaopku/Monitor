/**
 * Created by hzzhaoshengyu on 2016/9/1.
 */

var monitorItem = {

  gauges: [
    '',
    '',
    '',
    '',
    ''
  ],

  counters: [],

  timers: [],

  sets: [],

  timer_date: [],

  statsd_metrics: []

};

var alarmFlush = function dataReceive (ts, metrics) {
  for (var type in monitorItem) {
    if (monitorItem.hasOwnProperty(type)) {
      monitorItem[type].forEach(function (item) {
        console.log(item + ":" + metrics[type][item]);
      });
    }
  }
};

exports.inint = function (startupTime, config, events) {
  events.on('flush', alarmFlush);
  events.on('status', function () {console.log(JSON.stringify(status));});
  return true;
};
