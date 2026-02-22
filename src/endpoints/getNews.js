import { ramDB, News } from '../utils/api.js';

export async function news(server, url) {
	server.route({
		method: ['GET', 'POST'],
		url: url,
		handler: async (request, reply) => {
			const page = parseInt(request.query['page']) || 0;
			const cached = await ramDB.g('newsGlobal:'+page);
			if (cached)
				return cached;

			const newsPre = await News.fetchAllNews(page);
			let news = {};
			for (const el of newsPre)
				news['n'+el.ID] = el.NEWSrender();

			await ramDB.s('newsGlobal:'+page, news, 300);

			return news;
		}
	});
}