import { Auth, liketype, checkLike, likeSet, removeLike } from '../utils/api.js';

export async function like(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const b = request.query;
			const type = liketype(b.type);
			const uId = request.user.userId;

			console.log(b, type, uId);
			const check = await checkLike(b.ide, uId, type[2]);
			if (!check)
				return await likeSet(b.ide, type, uId);
			else
				return await removeLike(check, b.ide, type);
		}
	});
}

export async function dislike(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const b = request.query;
			const type = liketype(b.type);
			const uId = request.user.userId;

			const check = await checkLike(b.ide, uId, type[2]);
			if (!check)
				return await likeSet(b.ide, type, uId, true);
			else
				return await removeLike(check, b.ide, type);
		}
	});
}