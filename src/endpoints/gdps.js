import { ramDB, Gdps, Comments, News } from "../utils/api.js";

export async function gdps(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			const gId = request.query.id;

			const cache = await ramDB.g('gdpsF:'+gId);
			if (cache)
				return cache;

			console.log('getting gdps '+gId+'...')

			const [gdps, comms, news] = await Promise.all([
				Gdps.fetchById(gId),
				Comments.getComments(0, gId, 0),
				News.fetchNews(gId, 0)
			]);

			const json = {
				gdps: gdps.GDPSrender(),
				comments: {},
				news: {}
			};
			for (const el of comms)
				json.comments['c'+el.ID] = el.COMMrender();
			for (const el of news)
				json.news['n'+el.ID] = el.NEWSrender();

			await ramDB.s('gdpsF:'+gId, json, 300);

			return json;
		}
	});
}