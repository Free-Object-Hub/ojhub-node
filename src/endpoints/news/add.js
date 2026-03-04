import { Auth, ramDB, exploitPatch, parseFormData, Gdps, News, time, TGwebhookLog } from "../../utils/api.js";
import fs from 'fs/promises';

export async function add(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const [b, files] = await parseFormData(request.parts());
			const gId = b.gdps.slice(1);
			const uId = request.user.userId;
			const check = await Gdps.checkItem(uId,gId);
			if (check == 0)
				return [];

			const gdps = Gdps.fetchById(gId);
			console.log(uId,gId);
			let ext = '';
			if (files.files)
				ext = files.files.filename.split('.').pop().toLowerCase();

			const title = exploitPatch(b.title);
			const textPre = exploitPatch(b.text);
			const text = Buffer.from(textPre,'utf8').toString('base64');

			const news = await News.NEWSpost(uId, gId, text, time(), title, gdps.checked, ext);
			if (files.files) {
				let filename = `${process.env.IMGS}customnews/${news}.${ext}`;
				fs.writeFile(filename, files.files.buffer);
			}
			TGwebhookLog(`NEW NEWS ${news} with name ${title}:\n${text}`);
			await ramDB.r('gdpsF:'+gId);

			return news;
		}
	});
}