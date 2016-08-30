var logger = require('pomelo-logger').getLogger('san-monitor', 'app');
var bearcat = require('bearcat');
var argv = require('optimist').argv;

var contextPath = require.resolve('./context.json');
var TYPE_ALL = 'all';

var type = argv['type'] || TYPE_ALL;

bearcat.createApp([contextPath]);

bearcat.start(function () {

  if (type === TYPE_ALL) {
    type = ['redis', 'game', 'udp'];
  } else {
    type = type.split(",");
  }

  type.map(function (t) {
    var monitor = bearcat.getBean(t.toLowerCase() + "Monitor");
    if (monitor && monitor.start) {
      monitor.start();
    }
  });

  process.env.BEARCAT_DEBUG = true;
});

// Uncaught exception handler
process.on('uncaughtException', function (err) {
  logger.error('Caught exception: ' + err.stack);
});