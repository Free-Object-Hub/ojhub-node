import { ramDB, Comments, Vacans } from "../../utils/api.js";

export async function get(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			const vId = request.query.id;

			const cache = await ramDB.g('vacF:'+vId);
			if (cache)
				return cache;

			console.log('getting vac '+vId+'...')

			const [vacs, comms] = await Promise.all([
				Vacans.fetchVacanById(vId),
				Comments.getComments(5, vId, 0),
			]);

			const json = {
				gdps: {
                    ['v'+vacs.ID]: vacs.renderVacan()
                },
				comments: {},
			};
			for (const el of comms)
				json.comments['c'+el.ID] = el.COMMrender();

			await ramDB.s('vacF:'+vId, json, 300);

			return json;
		}
	});
}
