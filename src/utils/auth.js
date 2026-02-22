import { query, Gdps, Users, Comments } from './api.js';

export class Auth { // fastify prehadler's
	static async requirePerms(request, reply) {
		const token = request.headers['user-token'] || request.headers['User-Token'];
		//const device = request.headers['device-static'];

		if (!token) {
			return reply.code(401).send({
				error: 'Authentication required',
				code: '-2'
			});
		}

		let user = await Users.fetchByToken(token);
		if (!user)
			return reply.code(401).send({ 
				error: 'No user data',
				code: '-3'
			});
		if (user.priority == 0)
			return reply.code(403).send({ 
				error: 'Access denied',
				code: '-1'
			});
		request.user = user;
	};

	static async getUser(request, reply) {
		const token = request.headers['user-token'] || request.headers['User-Token'];
		if (token) {
			let user = await Users.fetchByToken(token);
			if (user) {
				request.user = user;
				request.uId = user.userId || user.ID;
			}
		}
	};

	static async requireDevice(request, reply) {
		const token = request.headers['user-token'] || request.headers['User-Token'];
		const device = request.headers['device-static'] || request.headers['Device-Static'];

		if (!token || !device) {
			return reply.code(401).send({ 
				error: 'Authentication required',
				code: '-2'
			});
		}

		let user = await Users.fetchByTokenAndDevice(token, device);
		if (!user)
			return reply.code(401).send({ 
				error: 'No user data',
				code: '-3'
			});
		if (user.activated == 0)
			return reply.code(403).send({ 
				error: 'Account not verified',
				code: '-4'
			});
		request.user = user;
	};

	static async isUserOwnComment(request, reply) {
		const id = request.query.ide || request.body.id || request.body.ide;
		const comm = await Comments.fetchById(id);
		if (!comm)
			return reply.code(404).send({ 
				error: 'Data not found',
				code: '-6'
			});
		request.commCh = comm.channel;
		request.commText = Buffer.from(comm.text,'base64').toString('utf8');

		if (request.user.priority == 0)
			if (request.user.userId !== comm.userId)
				return reply.code(403).send({ 
					error: 'Attempt to edit not owned comment',
					code: '-5'
				});
	};
	//last code -8

	static async isGdpsMy(request, reply) {
		if (!request.user?.userId)
			return reply.code(401).send({
				error: 'Authentication required',
				code: '-2'
			});

		const id = request.query.id || request.body.id;
		const gdps = await Gdps.fetchGdpsWithPerms(id, request.user.userId);

		if (!gdps)
			return reply.code(404).send({ 
				error: 'Data not found',
				code: '-6'
			});
		request.gdps = gdps;

		if (gdps.perms == 0)
			return reply.code(403).send({ 
				error: 'Access denied',
				code: '-1'
			});
	}
}