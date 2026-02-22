import { Auth, Users, ramDB, exploitPatch } from "../../utils/api.js";

export async function setNickname(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const user = request.user;
			const uId = user.userId || user.ID;

			const newNick = exploitPatch(request.query.name);
			const result = await Promise.all([
				Users.setNickname(uId, newNick),
				ramDB.r('user:'+uId),
				ramDB.r('userT:'+request.headers['user-token'])
			]);

			if (result[0])
				return newNick;
			else 
				return reply.code(400).send(newNick);
		}
	});
}

export async function setResume(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const user = request.user;
			const uId = user.userId || user.ID;

			const newResume = exploitPatch(request.body.name);
			const result = await Promise.all([
				Users.setResume(uId, newResume),
				ramDB.r('user:'+uId),
				ramDB.r('userT:'+request.headers['user-token'])
			]);

			if (result[0])
				return newResume;
			else 
				return reply.code(400).send(newResume);
		}
	});
}

export async function setSocials(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const user = request.user;
			const uId = user.userId || user.ID;

			const newSocials = exploitPatch(request.body.name);
			const result = await Promise.all([
				Users.setSocials(uId, newSocials),
				ramDB.r('user:'+uId),
				ramDB.r('userT:'+request.headers['user-token'])
			]);

			if (result[0])
				return newSocials;
			else 
				return reply.code(400).send(newSocials);
		}
	});
}