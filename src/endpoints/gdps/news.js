import { ramDB, News } from '../../utils/api.js';

export async function news(server, url) {
	server.route({
		method: ['GET', 'POST'],
		url: url,
		handler: async (request, reply) => {
			const page = parseInt(request.query['page']) || 0;
            const gId = parseInt(request.query['id']);

			const newsPre = await News.fetchNews(gId, page);
			let news = {};
			for (const el of newsPre)
				news['n'+el.ID] = el.NEWSrender();

			return news;
		}
	});
}