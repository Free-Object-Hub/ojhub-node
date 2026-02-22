import { Auth, Vacans, Applies, time } from "../../utils/api.js";

export async function apply(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const vId = request.query.id;
			const uId = request.user.ID || request.user.userId;

			const checkApply = await Applies.checkApply(vId, uId);
			let repl = '';

			if (!checkApply) repl = await Applies.applyVac([vId, uId, time()]);
			else repl = '-1';

			return repl;
		}
	});
}

export async function unapply(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const uId = request.user.ID || request.user.userId;
			const aId = request.query.id;
			let repl = await Applies.removeAplsByUser(uId, aId);
			return repl;
		}
	});
}