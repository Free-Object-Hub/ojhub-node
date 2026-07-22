import repl from 'repl';
import { query, ramDB, redis } from './utils/db.js';
import { Gdps } from './utils/gdpses.js';
import { allEndpoints } from './server.js';

function ramDbDrop() {
	redis.flushall((err, reply) => {
			if (err) reject(err);
			else console.log(reply);
		});
	console.log('ramDB cleared')
}

export function startRepl() {
	const ctx = repl.start({
		prompt: '@ ',
	}).context;
	ctx.query = query;
	ctx.ramDbDrop = ramDbDrop;
	ctx.Gdps = Gdps;
	ctx.ramDB = ramDB;
	ctx.all = allEndpoints;
	ctx.exit = ()=>{
		helperLogs(false);
		process.exit();
	}
}
