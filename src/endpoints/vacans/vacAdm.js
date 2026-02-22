import { Auth, Vacans, Gdps } from "../../utils/api.js";

export async function admin(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.getUser],
		handler: async (request, reply) => {
			const user = request.user;
			const uId = user.userId;
			const gId = request.query.id;
			const page = request.query.page || 0;
			const [gdps, check] = await Promise.all([
				Gdps.fetchById(gId),
				Gdps.checkItem(uId,gId)
			]);

			let vacsPre = [];
			if (check > 0)
				vacsPre = await Vacans.fetchVacansByGdps(gId, uId, true, page);
			else 
				vacsPre = await Vacans.fetchVacansByGdps(gId, uId, false, page);

			const gData = {
				gTitle: gdps.title,
				gChannel: gdps.channel
			};
			const Json = {
				'gdpsdata':[
					gdps.title
				],
				'vacs':{},
			}
			for (let el of vacsPre)
				Json.vacs['v'+el.ID] = Object.assign(el.renderVacan(),gData);

			return Json;
		}
	});
}