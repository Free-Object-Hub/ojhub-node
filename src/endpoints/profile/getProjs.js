import { ramDB, Users, Gdps, CH, GDPSswitchChannel } from "../../utils/api.js";

export async function gdpses(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			const chName = GDPSswitchChannel(request.query.type);

			const uId = parseInt(request.query.id);

			const [userCache, gdpsesCache] = await Promise.all([
				ramDB.g('user:'+uId),
				ramDB.g('user:'+chName+uId)
			]);
			const parallel = [
				Promise.resolve(gdpsesCache),
				Promise.resolve(userCache),
			];

			const json = [
				'???',
				{}
			];

			if (userCache)
				json[0] = userCache.nickname || userCache.username;
			else
				parallel[1] = Users.fetchById(uId);

			if (gdpsesCache)
				json[1] = gdpsesCache;
			else
				parallel[0] = Gdps.getAllMyContent(uId);

			const [gdpsesPre, user] = await Promise.all(parallel);

			if (!gdpsesCache) {
				let gdpses = {};
				gdpsesPre.flat().forEach(g=>{
					if (g.checked > 0 && g.channel == request.query.type)
						gdpses[chName+g.ID] = {
							ID: g.ID,
							title: g.title,
							text: g.description,
							author: user.author,
							username: user.username,
							img: g.img
						};
				});
				json[1] = gdpses;
				await ramDB.s('user:'+chName+uId, gdpses, 300);
			}

			if (!userCache) {
				await ramDB.s('user:'+uId, user, 300);
				json[0] = user.getNickname();
			}

			return json;
		}
	});
}