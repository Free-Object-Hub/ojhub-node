import { TGwebhookLog, Comments, Auth, liketype, channelsCommsToLikes } from '../../utils/api.js';

export async function remove(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isUserOwnComment],
		handler: async (request, reply) => {
			const q = request.query;
			Comments.deleteComm(q.ide, channelsCommsToLikes[request.commCh])
			TGwebhookLog(`REMOVED COMMENT ${q.ide}`);
			return q.ide;
		}
	});
}