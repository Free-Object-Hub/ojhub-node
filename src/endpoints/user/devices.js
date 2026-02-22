import { Auth, Users, Alarms, Device } from "../../utils/api.js";

export async function devices(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const user = request.user;

			const devicesPre = await user.getDevices();
			let devices = {};
			for (const el of devicesPre)
				devices[el.ID] = el.render();
			return devices;
		}
	});
}

export async function removeDevice(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const user = request.user;
			const uId = user.userId || user.ID;
			
			const data = await Device.removeDevice(uId, request.query.id);
			return data;
		}
	});
}