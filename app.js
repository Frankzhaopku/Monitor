var logger = require('pomelo-logger').getLogger('san-monitor', 'app');
var bearcat = require('bearcat');
var argv = require('optimist').argv;

var contextPath = require.resolve('./context.json');
var MODE_ALL = 'all';

var mode = argv['mode'] || MODE_ALL;

bearcat.createApp([contextPath]);

bearcat.start(function() {

    if (mode === 'all') {
        logger.info("all");
    } else {
        logger.info(mode);
    }

    process.env.BEARCAT_DEBUG = true;
});

// Uncaught exception handler
process.on('uncaughtException', function(err) {
    logger.error('Caught exception: ' + err.stack);
});