import { TGwebhookLog } from "../utils/api.js";
import https from 'https';

export async function reportGdps(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		handler: async (request, reply) => {
			let data = await TGwebhookLog(request.body);

			return data;
		}
	});
}
