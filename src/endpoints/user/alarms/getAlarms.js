import { Auth, Users, Alarms } from "../../../utils/api.js";

export async function get(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.getUser],
		handler: async (request, reply) => {
			const user = request.user;
			let alarm = await Alarms.getFullAlarm(request.query.id);

			if (alarm.userId == user.userId || user.priority > 0)
				return alarm.render();
			else 
				return '{}';
		}
	});
}