import { TGwebhookLog, Comments, Auth, time } from '../../utils/api.js';

export async function modify(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isUserOwnComment],
		handler: async (request, reply) => {
			const b = request.body;
			if (b.type == 1)
				b.type = 0;
			if (b.text?.length > 10) {
				await Comments.modifyComment(
					b.id,
					Buffer.from(b.text,'utf8').toString('base64'),
				);
				TGwebhookLog(`MODIFIED COMMENT ${b.id}, text:\n\n${b.text}`);
				return b.text;
			}
			return reply.code(403).send({
				error: 'text too short',
				code: '-7',
			});
		}
	});
}