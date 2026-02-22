import { getCity } from '../utils/api.js';

export function city(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			return getCity(request.query.city);
		}
	});
}