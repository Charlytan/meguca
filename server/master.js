var cluster = require('cluster'),
	config = require('../config'),
	opts = require('./opts'),
	tripcode = require('./../tripcode/tripcode');

if (!process.getuid())
	throw new Error("Refusing to run as root.");
if (!tripcode.setSalt(config.SECURE_SALT))
	throw "Bad SECURE_SALT";
if (require.main == module)
	opts.parse_args();
opts.load_defaults();
opts.writePID();

if (cluster.isMaster) {
	cluster.fork().on('message', function(msg) {
		console.log(msg);
	});
	// Propagate hot reload
	process.on('SIGHUP', function() {
		for (var i of cluster.workers) {
			i.send('hotReload');
		}
	});
}
else {
	require('./server');
}
