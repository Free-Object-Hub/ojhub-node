import { Auth, ramDB, exploitPatch, Gdps, News, TGwebhookLog } from "../../utils/api.js";

export async function edit(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			//const [b, files] = await parseFormData(request.parts());
			const b = request.body;
			const id = b.id;
			const gId = b.gdps;
			const uId = request.user.userId;
			console.log(b);
			console.log(uId,gId);
			const check = await Gdps.checkItem(uId,gId);
			if (check == 0)
				return [];

			const gdps = Gdps.fetchById(gId);
			let ext = '';

			const title = exploitPatch(b.title);
			const textPre = exploitPatch(b.text);
			const text = Buffer.from(textPre,'utf8').toString('base64');

			const news = await News.NEWSedit(id, text, title, gId);
			if (news > 0) {
				TGwebhookLog(`EDIT NEWS ${id} with name ${title}:\n${text}`);
				await ramDB.r('gdpsF:'+gId);
			}
			return [title, textPre];
		}
	});
}
