import repl from 'repl';
import { query, ramDB, redis } from './utils/db.js';
import { allEndpoints } from './server.js';

function helperLogs(print = true) {
	// file_put_contents(лох):
	if (print)
		return 1;
	return;
}

function ramDbDrop() {
	redis.flushall((err, reply) => {
			if (err) reject(err);
			else console.log(reply);
		});
	console.log('ramDB cleared')
}

export function startRepl() {
	const ctx = repl.start({
		prompt: '# ',
	}).context;
	ctx.helperLogs = helperLogs;
	ctx.query = query;
	ctx.ramDbDrop = ramDbDrop;
	ctx.ramDB = ramDB;
	ctx.all = allEndpoints;
	ctx.exit = ()=>{
		helperLogs(false);
		process.exit();
	}
}