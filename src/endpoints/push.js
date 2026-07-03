import { Auth, saveSubscription, query } from '../utils/api.js';

async function sub(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			let b = new URLSearchParams(request.body),
				endpoint = b.get('endpoint'),
				p256dh = b.get('p256dh'),
				auth = b.get('auth');
			if (!endpoint || typeof endpoint !== 'string' || !p256dh || !auth) {
				return reply.code(400).send('-3');
			}
			if (endpoint.length > 500) {
				return reply.code(400).send('-2');
			}

			const deviceToken = request.headers['device-static'] || request.headers['Device-Static'],
				uId = request.user.userId;
			if (!deviceToken)
				return reply.code(400).send('-4');
			const deviceRow = await query('SELECT ID FROM devices WHERE staticFp = ? AND userId = ?', [deviceToken, uId]);
			if (!deviceRow?.[0]?.ID)
				return reply.code(400).send('-5');
			const dId = deviceRow?.[0]?.ID;

			try {
				await saveSubscription(
					request.user.userId,
					dId,
					{ endpoint: endpoint, keys: { p256dh: p256dh, auth: auth } },
					request.headers['user-agent']?.slice(0, 255)
				);
				reply.send('1');
			} catch (err) {
				console.error('sub.php error:', err);
				reply.code(500).send('-1');
			}
		}
	});
}

export { sub as 'sub.php' }
