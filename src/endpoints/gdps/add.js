import {
	Auth,
	time,
	exploitPatch,
	Gdps,
	TGwebhookLog,
	createBitmask,
	HELPER_URL,
	loginToken,
	ramDB,
	parseFormData
} from '../../utils/api.js';
import fs from 'fs/promises';

export async function add(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const [b, files] = await parseFormData(request.parts());

			const channel = parseInt(b.channel);
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
				channel,
				title,
				JSON.stringify(link),
				img,
				ban,
				description,
				short,
				tags,
				os,
				bitmask.toString(),
				request.user.userId,
				request.user.getNickname(),
				language,
			];
			console.log(data)
			const gdpsId = await Gdps.addGdps(data);

			const uploFiles = [];
			const fileNames = {
				img: '',
				ban: ''
			}
			if (files.img) {
				let ext = files.img.filename.split('.').pop().toLowerCase();
				fileNames.img = `${process.env.IMGS}imgs/customuser/i${gdpsId}.${ext}`;
				uploFiles.push(fs.writeFile(fileNames.img, files.img.buffer));
				fileNames.img = `${HELPER_URL}imgs/customuser/i${gdpsId}.${ext}`;
			}
			if (files.ban) {
				let ext = files.ban.filename.split('.').pop().toLowerCase();
				fileNames.ban = `${process.env.IMGS}imgs/customuser/b${gdpsId}.${ext}`;
				uploFiles.push(fs.writeFile(fileNames.ban, files.ban.buffer));
				fileNames.ban = `${HELPER_URL}imgs/customuser/b${gdpsId}.${ext}`;
			}
			uploFiles.push(Gdps.refreshAvatar(
				gdpsId, 
				fileNames.img || img,
				fileNames.ban || ban
			));

			await Promise.all(uploFiles);
			TGwebhookLog(`NEW GDPS ${gdpsId}/${channel} with name ${title}`);
			await ramDB.r('userTc:'+request.headers['user-token']);
			return await loginToken(request.ip, request.headers['user-token'], request.headers['device-static']);
		}
	});
}