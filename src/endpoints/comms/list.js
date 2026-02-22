import { Comments, channelsObjsToComm } from "../../utils/api.js";

export async function list(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			const q = request.query;
			const channel = parseInt(q.type);
			const id = parseInt(q.id);
			const page = parseInt(q.page) || 0;
			const comms = await Comments.getComments(channel, id, page);

			const json = {};
			for (const el of comms)
				json['c'+el.ID] = el.COMMrender();
			return json;
		}
	});
}