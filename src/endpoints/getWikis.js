import { NewGdpsFinder } from '../utils/api.js';

export async function wiki(server, url) {
	server.route({
		method: ['GET', 'POST'],
		url: url,
		handler: async (request, reply) => {
			const page = parseInt(request.query['page']) || 0;
			const wikisPre = await NewGdpsFinder(0, -1, page);
			let wikis = {};
				for (const el of wikisPre)
					wikis['w'+el.ID] = el.renderWiki();

			return wikis;
		}
	});
}