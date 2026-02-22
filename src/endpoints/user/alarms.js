import { Auth, Users, Alarms } from "../../utils/api.js";

export async function alarms(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.getUser],
		handler: async (request, reply) => {
			const user = request.user;
			const uId = request.uId;

			const page = parseInt(request.query['page']) || 0;
			let alarmsPre = await Alarms.getAlarmsList(uId, user.priority, page);

			let alarms = [];
			for (const el of alarmsPre)
				alarms.push(el.renderMini());

			return alarms;
		}
	});
}