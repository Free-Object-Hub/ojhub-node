import { ramDB, Comments, News } from "../../utils/api.js";

export async function get(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			const nId = request.query.id;

			const cache = await ramDB.g('newsF:'+nId);
			if (cache)
				return cache;

			console.log('getting news '+nId+'...')

			const [news, comms] = await Promise.all([
				News.fetchById(nId),
				Comments.getComments(3, nId, 0),
			]);

			const json = {
				gdps: {
                    ['n'+news.ID]: news.NEWSrender()
                },
				comments: {},
			};
			for (const el of comms)
				json.comments['c'+el.ID] = el.COMMrender();

			await ramDB.s('newsF:'+nId, json, 300);

			return json;
		}
	});
}