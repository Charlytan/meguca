var config = require('../config'),
	fs = require('fs'),
    minimist = require('minimist'),
    path = require('path'),
	winston = require('winston');

function usage() {
	process.stderr.write(
	  "Usage: node server/server.js\n"
	+ "       --host <host> --port <port>\n"
	+ "       --pid <pid file location>\n"
	+ "\n"
	+ "<port> can also be a unix domain socket path.\n"
	);
	process.exit(1);
}

exports.parse_args = function () {
	var argv = minimist(process.argv.slice(2));

	if ('h' in argv || 'help' in argv)
		return usage();

	if (argv.port)
		config.LISTEN_PORT = argv.port;
	if (argv.host)
		config.LISTEN_HOST = argv.host;
	if (argv.pid)
		config.PID_FILE = argv.pid;
};

exports.load_defaults = function () {
	if (!config.PID_FILE)
		config.PID_FILE = path.join(__dirname, '.server.pid');
};

exports.writePID = function() {
	if (!config.PID_FILE)
		config.PID_FILE = path.join(__dirname, '.server.pid');
	fs.writeFile(config.PID_FILE, process.pid+'\n', function (err) {
		if (err)
			return winston.warn("Couldn't write pid: " + err);
		process.once('SIGINT', delete_pid);
		process.once('SIGTERM', delete_pid);
		winston.info('PID ' + process.pid + ' written in ' + config.PID_FILE);
	});
};

function delete_pid() {
	try {
		fs.unlinkSync(config.PID_FILE);
	}
	catch (e) { }
	process.exit(1);
}