import { Auth, Vacans, Gdps, time, exploitPatch, createBitmask, parseFormData } from "../../utils/api.js";

export async function remove(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const q = request.query;
			const vId = q.id;
			const user = request.user;
			const uId = user.userId;

			const vac = await Vacans.fetchVacanById(vId);

			const gId = vac.gdpsId;
			const check = await Gdps.checkItem(uId,gId);

			let res = '';
			if (check)
				res = await Vacans.removeVac(vId);

			return res;
		}
	});
}