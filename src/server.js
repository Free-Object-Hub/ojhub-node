import Fastify from 'fastify';
//import { startRepl } from './repl.js';

import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart';
import { fileURLToPath, pathToFileURL } from 'url';

import { Gdps, Wikis, News, Vacans } from './utils/api.js'; 


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

fastify.route({
	method: ['GET'],
	url: '/',
	handler: async (request, reply) => {
        let meta = `<meta property="og:title" content="Object hub">
                    <meta property="og:description" content="Удобный сервис для поиска и размещения своих обджект шоу и кемпов!">
                    <meta property="og:image" content="https://objecthub.xyz/imgs/hubbig.png">`;
		const defResp = 'metatag';
		const b = request.query;
		if (b['Wikis'])
            meta = `<meta property="og:title" content="Object Hub Wiki">
                    <meta property="og:description" content="Добро пожаловать на наш редактор пользовательских вики!">
                    <meta property="og:image" content="https://objecthub.xyz/imgs/hubbig.png">`
		if (b['camp'] || b['show'] || b['pere']) {
			let gIdPre = b['camp'] || b['show'] || b['pere'];
			let gId = parseInt(gIdPre);
			if (Number.isNaN(gId))
				return defResp;
			let gdps = await Gdps.fetchById(parseInt(gId));
            meta = `<meta property="og:title" content="${gdps.title}">
                    <meta property="og:description" content="${gdps.short}">
                    <meta property="og:image" content="${gdps.img}">`;
		}
		if (b['wiki']) {
			let gIdPre = b['wiki'];
			let gId = parseInt(gIdPre);
			if (Number.isNaN(gId))
				return defResp;
			let gdps = await Wikis.fetchById(parseInt(gId));
            meta = `<meta property="og:title" content="${gdps.title}">
                    <meta property="og:description" content="${gdps.text}">
                    <meta property="og:image" content="https://objecthub.xyz/imgs/hubbig.png">`;
		}
        if (b['VacsC']) {
            let nId = b['VacsC'];
            let news = await Vacans.fetchById(nId);
            let gdps = await Gdps.fetchById(news.gdpsId);
            meta = `<meta property="og:title" content="${news.title}">
                    <meta property="og:description" content="${news.text}">
                    <meta property="og:image" content="${gdps.img}">`;
        }
        if (b['news/comms']) {
            let nId = b['news/comms'].split('|')[0];
            let news = await News.fetchById(nId);
            let gdps = await Gdps.fetchById(news.gdpsId);
            let decodedText = Buffer.from(news.text, 'base64').toString('utf-8');
            meta = `<meta property="og:title" content="${news.title}">
                    <meta property="og:description" content="${decodedText}">
                    <meta property="og:image" content="${gdps.img}">`;
        }

        let html = `<!DOCTYPE html>
            <html>
                <head>
                    <meta name=viewport content="width=device-width,initial-scale=1.0">
                    <meta charset=UTF-8>
                    ${meta}
                    <title>Object Hub</title>
                    <link rel=icon>
                    <link href="./static/main.css?ver=20" rel=stylesheet>
                    <link href="./static/window.css?ver=20" rel=stylesheet>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Unbounded:wght@200..900&display=swap" rel="stylesheet">
                    <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Huninn&family=Manrope:wght@200..800&family=News+Cycle:wght@400;700&family=Unbounded:wght@200..900&display=swap" rel="stylesheet">
                    <script src="./static/newHelper.js?ver=20"></script>
                    <script defer src="./static/nhConfig.js?ver=20"></script>
                    <style id=wikiStyle></style>
                </head>
                <body style="background-color:var(--color-bg)">
                    <div id=1st></div>
                    <div id=windowsXP>
                        <div id=Professional class=hider></div>
                    </div>
                </body>
            </html>`;
        return reply.type('text/html').send(html);
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
