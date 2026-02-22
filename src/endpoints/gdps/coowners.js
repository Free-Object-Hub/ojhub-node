import { Users, Auth, Owners, Gdps } from '../../utils/api.js';

export async function owners(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isGdpsMy],
		handler: async (request, reply) => {
			//const user = request.user;
			const gdps = request.gdps;

			let Json = [
				[
					gdps.title
				],
				[]
			];
			let owners = await Owners.fetchOwners(gdps.ID, gdps.channel)

			for (let o in owners)
				Json[1].push([owners[o].username, o]);

			return Json;
		}
	});
}

export async function addOwner(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isGdpsMy],
		handler: async (request, reply) => {
			//const user = request.user;
			const gdps = request.gdps;
			const owner = await Users.fetchById(request.query.user);

			const Json = [
				owner.getNickname(),
				owner.userId
			],
			res = await Owners.addOwner(gdps.ID, owner.userId, gdps.channel);
			if (res) return Json;
			else return '-2'
		}
	});
}

export async function deleteOwner(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isGdpsMy],
		handler: async (request, reply) => {
			//const user = request.user;
			const gdps = request.gdps;
			const owner = await Users.fetchById(request.query.user);

			const Json = [
				owner.getNickname(),
				owner.userId
			],
			res = await Owners.deleteOwner(gdps.ID, owner.userId, gdps.channel);
			if (res) return Json;
			else return '-2'
		}
	});
}