import { ramDB, Users } from "../utils/api.js";

export async function profile(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			const uId = parseInt(request.query.id);
			const cache = await ramDB.g('userF:'+uId);
			if (cache)
				return cache;

			const user = await Users.fetchById(uId);
			const json = user.renderPublic();

			await ramDB.s('userF:'+uId, user, 300);

			return json;
		}
	});
}