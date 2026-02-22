import Fastify from 'fastify';
//import { startRepl } from './repl.js';

import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import { fileURLToPath, pathToFileURL } from 'url';

import fs from 'fs';
import path from 'path';

const addr = '/v1';
const loadEndpoints = async function (dir, currentPath = '/') {
	const files = fs.readdirSync(dir);
	const loadPromises = files.map(async filePath => {
		const name = path.basename(filePath).split('.');

		if (name.length == 1)
			return loadEndpoints(dir + name[0] + '/', currentPath + name[0] + '/');

		const absolutePath = pathToFileURL(path.resolve(dir + filePath));
		const endpoints = await import(absolutePath);
		for (const endpoint in endpoints) {
			const endpointName = addr + currentPath + endpoint;
			//console.log('==> ' + endpointName);
			allEndpoints[endpointName] = endpoints[endpoint];
		}
	});

	await Promise.all(loadPromises);
};
let startTime = Date.now();
const endpoints = './src/endpoints/';
let allEndpoints = {};
await loadEndpoints(endpoints);
console.log(`=> Endpoints loaded for ${Date.now() - startTime}ms`);

const fastify = Fastify({
	logger: {
		level: 'error'
	}
});

for (let e in allEndpoints)
	allEndpoints[e](fastify, e.replaceAll('_', ''));
console.log(`=> Endpoints done`);

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

fastify.register(formbody);
fastify.register(multipart, {
	limits: {
		body: 12 * 1024 * 1024,
		fileSize: 6 * 1024 * 1024,
		files: 2,
        fields: 30,
        fieldSize: 1024 * 1024
	}
});
await fastify.register(cors, {
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: [
		'Origin',
		'X-Requested-With',
		'Content-Type',
		'Accept',
		'User-token',
		'Device-static'
	],
    maxAge: 86400,
    credentials: true
});
console.log('=> Fastify done');

fastify.listen({ port: 3000 }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log(`=> Server done at ${address} with:`, allEndpoints);
	//startRepl();
});