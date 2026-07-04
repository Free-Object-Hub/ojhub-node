import { Alarms, parseFormData, Auth, time } from '../../utils/api.js';

export async function writeAlarm(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const [b, files] = await parseFormData(request.parts());
			const check = request.user.priority;
			let uId = request.user.userId;
			if (check == 0)
				return 0;
			if (b.anonymus)
				uId = 0;

			await Alarms.fullWrite(b.title, b.text, b.user, time(), uId)
		}
	});
}
