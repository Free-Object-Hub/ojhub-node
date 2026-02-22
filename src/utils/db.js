import mysql from 'mysql2/promise';
import { Reader as geoReader } from '@maxmind/geoip2-node';
import Redis from 'ioredis';

const dbCfg = {
	database:	process.env.SQL_DB,
	user:		process.env.SQL_USER,
	password:	process.env.SQL_PASSWD,
	host:		process.env.SQL_HOST,
	port:		process.env.SQL_PORT,

	waitForConnections: true,
	queueLimit: 2000,

	connectionLimit: 50,
	connectTimeout: 2000,

	maxIdle: 15,
	idleTimeout: 600000,

	enableKeepAlive: true,
	keepAliveInitialDelay: 30000,

	decimalNumbers: true,
	charset: 'utf8mb4',
};
const pool = mysql.createPool(dbCfg);
const cityDB = await geoReader.open('./GeoLite2-City.mmdb');
const redis = new Redis({
	host:		process.env.RAMDB_HOST,
	port:		process.env.RAMDB_PORT,
	password:	process.env.RAMDB_PASSWD || undefined,
	db:			process.env.RAMDB_NUM,
	retryStrategy: (times) => {
		const delay = Math.min(times * 500, 5000);
		console.log(`==> Redis reconnect failed after ${delay}ms`);
		return delay;
	},
	enableReadyCheck: true,
	commandTimeout: 5000,
	maxConnections: 20,
	enableOfflineQueue: false,
	maxRetriesPerRequest: 0,
});
let ramDbWorking = false;
redis.on('connect', () => {
	console.log('=> Redis connected');
});
redis.on('ready', () => {
	console.log('=> Redis done');
	ramDbWorking = true;
});
redis.on('end', () => {
  console.log('=> Redis closed');
  ramDbWorking = false;
});
redis.on('error', (error) => {
  console.error('=> Redis: ', error.message);
  ramDbWorking = false;
});

class RamDbBuilder {
	constructor(ramdb) {
		this.driver = ramdb;
	}
	async g(key) {
		if (!ramDbWorking)
			return null;
		try {
			const value = await this.driver.get(key);
			if (value === null || value === undefined) return null;
			return JSON.parse(value);
		} catch (error) {
			if (!error.message.includes('Unexpected token')) {
				console.error(`RamDB key "${key}" err:`, error.message);
			}
			return null;
		}
	}
	async s(key, value, ttl = null) {
		if (!ramDbWorking)
			return false;
		const newValue = JSON.stringify(value);
		if (ttl)
			return await this.driver.setex(key, ttl, newValue);
		return await this.driver.set(key, newValue);
	}
	async rr(key, value, ttl = null) {
		if (!ramDbWorking)
			return false;
		await this.r(key);
		return await this.s(key, value, ttl);
	}
	async r(key) {
		if (!ramDbWorking)
			return false;
		return await this.driver.del(key);
	}
};

const ramDB = new RamDbBuilder(redis);

export { ramDB, redis };

export async function query(sql, params = []) {
	const [rows, techData] = await pool.execute(sql, params);
	return rows;
}

export async function queryOne(sql, params = [], assignClass = null) {
	const rows = await query(sql, params),
	row = rows[0];

	if (!row)return null;

	return assignClass ? new assignClass(row) : row;
}

export function getCity(IP) {
	if (IP === '127.0.0.1')
		IP = '91.244.81.155';
		//return ['Localhost', 'CurrentPC'];
	const data = cityDB.city(IP);

	const country = data.country?.names?.en || 'Unknown';
	const city = data.city?.names?.en || 'Unknown';

	return [country, city];
}

export { pool };