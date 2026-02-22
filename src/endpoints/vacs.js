import { Auth, NewGdpsFinder, vacansAppliesReader } from '../utils/api.js';

export async function vacans(server, url) {
	server.route({
		method: ['GET', 'POST'],
		url: url,
		preHandler: [Auth.getUser],
		handler: async (request, reply) => {
			const page = parseInt(request.query['page']) || 0;
			const vacsPre = await NewGdpsFinder(0, -5, page);
			let vacs = {};
			for (const el of vacsPre)
				vacs['v'+el.ID] = el.renderVacanMini();
			if (request.user)
				vacs = vacansAppliesReader(request, reply, vacs);

			return vacs;
		}
	});
}