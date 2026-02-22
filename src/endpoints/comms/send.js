import { TGwebhookLog, Comments, Auth, time } from '../../utils/api.js';

export async function send(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const b = request.body;
			if (b.type == 1)
				b.type = 0;
			if (b.text?.length > 10) {
				await Comments.addComment(
					request.user.userId,
					b.ide,
					Buffer.from(b.text,'utf8').toString('base64'),
					time(),
					b.type
				);
				TGwebhookLog(`NEW COMMENT UNDER ${b.ide}/${b.type}, text:\n\n${b.text}`);
			}

			const comms = await Comments.getComments(b.type, b.ide, 0);
			if (b.text?.length <= 10)
				return reply.code(403).send(comms.map(el=>el.COMMrender()));
			return comms.map(el=>el.COMMrender());
		}
	});
}