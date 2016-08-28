var logger = require('pomelo-logger').getLogger('san-monitor', 'app');
var bearcat = require('bearcat');
var argv = require('optimist').argv;

var contextPath = require.resolve('./context.json');
var MODE_ALL = 'all';

var mode = argv['mode'] || MODE_ALL;

bearcat.createApp([contextPath]);

var capitalize = function (str) {
   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

bearcat.start(function() {

    if (mode === MODE_ALL) {
        mode = ['Redis', 'Server', 'Udp'];
    } else {
        mode = mode.split(",");
    }

    mode.map(function (type) {
        var monitor = bearcat.getBean(capitalize(type) + "Monitor");
        if (monitor) monitor.test();
    });

    process.env.BEARCAT_DEBUG = true;
});

// Uncaught exception handler
process.on('uncaughtException', function(err) {
    logger.error('Caught exception: ' + err.stack);
});