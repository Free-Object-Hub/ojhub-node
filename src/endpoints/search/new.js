import { ramDB, NewGdpsFinder, GDPSswitchChannel, vacansAppliesReader, Auth } from '../../utils/api.js';

export async function global(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.getUser],
		handler: async (request, reply) => {
			const q = request.query;
			const method = parseInt(q.method);
			const channel = parseInt(q.channel);
			const page = parseInt(q.page);
			let tags = request.query['tags[]'] || [];
			let os = request.query['os[]'] || [];
			const name = request.query['name'] || '';

			if (typeof tags == 'string')
				tags = [tags];
			if (typeof os == 'string')
				os = [os];

			const ramDbKey = `search_${channel}:${method}&${page}&${tags.toString()}&${os.toString()}`;
			if (!name) {
				const ramDbValue = await ramDB.g(ramDbKey);
				if (ramDbValue && channel != -5)
					return ramDbValue;
				else if (ramDbValue)
					return vacansAppliesReader(request, reply, ramDbValue);
			}
			console.log(method, channel, page, tags, os, name, ramDbKey);

			const gdpsesPre = await NewGdpsFinder(
				method,
				channel,
				page,
				tags,
				os,
				name
			);
			let gdpses = {};
			switch (channel) {
				case -5:
					for (const el of gdpsesPre)
						gdpses['v'+el.ID] = el.renderVacanMini();
					break;
				case -2:
					for (const el of gdpsesPre)
						gdpses[GDPSswitchChannel(el.channel)+el.ID] = el.GDPSrenderLT();
					break;
				case -1:
					for (const el of gdpsesPre)
						gdpses['w'+el.ID] = el.renderWiki();
					break;
				case 0:
					for (const el of gdpsesPre)
						gdpses['c'+el.ID] = el.GDPSrenderLT();
					break;
				case 1:
					for (const el of gdpsesPre)
						gdpses['s'+el.ID] = el.GDPSrenderLT();
					break;
				case 2:
					for (const el of gdpsesPre)
						gdpses['p'+el.ID] = el.GDPSrenderLT();
					break;
			}

			if (!name)
				ramDB.s(ramDbKey, gdpses, 300);
			const user = request.user;
			if (user) {
				if (channel == -5)
					gdpses = vacansAppliesReader(request, reply, gdpses);
			}

			return gdpses;
		}
	});
}