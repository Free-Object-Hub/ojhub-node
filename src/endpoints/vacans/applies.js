import { Auth, Vacans, Gdps, Applies } from "../../utils/api.js";

export async function applies(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.getUser],
		handler: async (request, reply) => {
			const user = request.user;
			const uId = user.userId;
			const vId = request.query.vacid;
			const vac = await Vacans.fetchVacanById(vId);
			const gdps = await Gdps.fetchById(vac.gdpsId);
			const check = await Gdps.checkItem(uId,gdps.ID);
			if (check > 0) {
				const page = request.query.page || 0;

				const aplsPre = await Applies.fetchApplies(vId, page);

				const Json = {
					'gdpsdata':[
						gdps.title
					],
					'applies':{},
				}
				for (let el of aplsPre)
					Json.applies['a'+el.ID] = el.renderApply();

				return Json;
			} else return [];
		}
	});
}

export async function removeApl(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.getUser],
		handler: async (request, reply) => {
			const user = request.user;
			const uId = user.userId;
			const check = await Gdps.checkItem(uId,request.query.gdpsId);
			if (check > 0) {
				const data = await Applies.removeApl(request.query.id);
				return data;
			}
		}
	});
}