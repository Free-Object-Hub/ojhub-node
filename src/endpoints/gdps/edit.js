import {
	Auth,
	time,
	exploitPatch,
	Gdps,
	TGwebhookLog,
	createBitmask,
	HELPER_URL,
	loginToken,
	parseFormData,
	ramDB
} from '../../utils/api.js';

export async function edit(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isGdpsMy],
		handler: async (request, reply) => {
			const g = request.gdps;
			return [
				g.title,
				g.description,
				g.short,
				JSON.parse(g.link.replaceAll('\\','')),
				g.img,
				g.ban,
				g.tags,
				g.os,
				g.language
			]
		}
	});
}

export async function edit_(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isGdpsMy],
		handler: async (request, reply) => {
			const [b, files] = await parseFormData(request.parts());
			
			const gdpsId = parseInt(b.gdpsId) || parseInt(request.query.id);
			const title = exploitPatch(b.title);
			const description = exploitPatch(b.description);
			const short = exploitPatch(b.short);
			const language  = exploitPatch(b.language);
			let tagsPre =	Array.isArray(b['tags[]']) === false? [b['tags[]']] :	b['tags[]'];
			let osPre =		Array.isArray(b['os[]']) === false	? [b['os[]']] :		b['os[]'];
			const [tags, os] = [JSON.stringify(tagsPre), JSON.stringify(osPre)];
		
			if (!tags || tags.length === 0)
				return reply.code(400).send({
					error: 'Missing tags',
					code: '-8'
				});
			if (!os || os.length === 0)
				return reply.code(400).send({
					error: 'Missing os',
					code: '-8'
				});
			const bitmask = createBitmask(tags.concat(os));
		
			let links = exploitPatch(b['links[]']);
			let link = {};
			for (let i = 0; i < links.length; i += 2) {
				const social = links[i];
				const address = links[i + 1];
				link[social] = address;
			}
			let img = b.img ? exploitPatch(b.img) : time();
			let ban = b.ban ? exploitPatch(b.ban) : time();
			const data = [
				title,
				JSON.stringify(link),
				img,
				ban,
				description,
				short,
				tags,
				os,
				bitmask.toString(),
				language,
				gdpsId
			];
			const modified = await Gdps.editGdps(data);
			if (modified == 0)
				return reply.code(403).send({ 
					error: 'Access denied',
					code: '-1'
				});

			const uploFiles = [];
			const fileNames = {
				img: '',
				ban: ''
			}
			if (files.img) {
				let ext = files.img.filename.split('.').pop().toLowerCase();
				fileNames.img = `${process.env.IMGS}customuser/i${gdpsId}.${ext}`;
				uploFiles.push(fs.writeFile(fileNames.img, files.img.buffer));
				fileNames.img = `${HELPER_URL}customuser/i${gdpsId}.${ext}`;
			}
			if (files.ban) {
				let ext = files.ban.filename.split('.').pop().toLowerCase();
				fileNames.ban = `${process.env.IMGS}customuser/b${gdpsId}.${ext}`;
				uploFiles.push(fs.writeFile(fileNames.ban, files.ban.buffer));
				fileNames.ban = `${HELPER_URL}customuser/b${gdpsId}.${ext}`;
			}
			uploFiles.push(Gdps.refreshAvatar(
				gdpsId, 
				fileNames.img || img,
				fileNames.ban || ban
			));
		
			await Promise.all(uploFiles);
			TGwebhookLog(`CHANGED GDPS ${gdpsId} with name ${title}`);
			await ramDB.r('userTc:'+request.headers['user-token']);
			return await loginToken(request.ip, request.headers['user-token'], request.headers['device-static'], false, true);
		}
	});
}