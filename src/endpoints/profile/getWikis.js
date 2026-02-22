import { ramDB, Users, Wikis, CH } from "../../utils/api.js";

export async function wikis(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			const uId = parseInt(request.query.id);

			const [userCache, wikisCache] = await Promise.all([
				ramDB.g('user:'+uId),
				ramDB.g('user:w'+uId)
			]);
			const parallel = [
				Promise.resolve(wikisCache),
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

			if (wikisCache)
				json[1] = wikisCache;
			else
				parallel[0] = Wikis.getAllMyContent(uId);

			const [wikisPre, user] = await Promise.all(parallel);

			if (!wikisCache) {
				let wikis = {};
				wikisPre.flat().forEach(g=>{
					if (g.checked > 0)
						wikis['w'+g.ID] = {
							ID: g.ID,
							title: g.title,
							text: g.text || '',
							author: user.userId,
							username: user.username,
							ban: g.img
						};
				});
				json[1] = wikis;
				await ramDB.s('user:w'+uId, wikis, 300);
			}

			if (!userCache) {
				await ramDB.s('user:'+uId, user, 300);
				json[0] = user.getNickname();
			}

			return json;
		}
	});
}