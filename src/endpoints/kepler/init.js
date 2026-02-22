import { query, Gdps, Users, User, Auth, GDPSswitchChannel } from '../../utils/api.js';

async function getAllGdpses() {
	let gdpses = await query('SELECT * FROM gdpses ORDER BY `checked` != 0, `ID` DESC');
	return gdpses.map(el=>new Gdps(el));
}

export async function init(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requirePerms],
		handler: async (request, reply) => {
			let Json = {
				gdpses: {},
				wikis: [],
			};
			let gdpses = await getAllGdpses();
			gdpses.forEach(el => {
				Json.gdpses[GDPSswitchChannel(el.channel)+el.ID] = el;
			});

			return Json;
		}
	});
}
