import { ramDB, Auth, loginToken, query } from '../utils/api.js';

export function loginT(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			let token = request.headers['user-token'] || request.headers['User-Token'];
			let device = request.headers['device-static'] || request.headers['Device-Static'];
			console.log(token, device)
			console.log(token && device)
			if (token && device)
				return await loginToken(request.ip, token, device, true);
			else
				return await loginToken(request.ip);
		}
	});
}

export function likesT(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDeviceNoVerify],
		handler: async (request, reply) => {
			const cache = await ramDB.g(`likes:${request.user.userId}`)
			if (cache)
				return cache;
			const lt2 = {
				'0': 'p',
				'1': 'c',
				'2': 'n',
				'3': 'c',
				'4': 'c',
				'5': 'c',
				'6': 'n',
				'7': 'g',
				'8': 'w',
				'9': 'f',
				'10': 'c',
				'11': 'v',
				'12': 'c',
			};

			const newD = {};
			for (let i in lt2)
				newD[lt2[i]] = [];

			if (request.user.activated == 0)
				return newD;

			const likesD = await query(
				`SELECT * FROM likes WHERE userId = ? ORDER BY channel ASC`,
				[request.user.userId]
			);
			likesD.forEach(e=>{
				const ch = e.channel.toString();
				if (e)
					newD[lt2[ch]].push(
						(e.whereIz * e.type)
					);
			});
			for (let i in newD) newD[i] = newD[i].sort((a,b)=> Math.abs(b) - Math.abs(a));
			await ramDB.s(`likes:${request.user.userId}`, newD, 1800);
			return newD;
		}
	});
}
