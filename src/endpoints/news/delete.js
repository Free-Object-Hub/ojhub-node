import { TGwebhookLog, News, Auth} from '../../utils/api.js';

export async function remove(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isUserOwnNews],
		handler: async (request, reply) => {
			const q = request.query;
			await News.deleteNews(q.ide);
			TGwebhookLog(`REMOVED NEWS ${q.ide}`);
			return q.ide;
		}
	});
}
