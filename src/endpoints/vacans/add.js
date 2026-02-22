import { Auth, Vacans, Gdps, time, exploitPatch, createBitmask, parseFormData } from "../../utils/api.js";

export async function add(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice],
		handler: async (request, reply) => {
			const [b] = await parseFormData(request.parts());

			const user = request.user;
			const uId = user.userId;
			const gId = b.id;
			const check = await Gdps.checkItem(uId,gId)
			if (check > 0) {
				const gdps = await Gdps.fetchById(gId);
				let title = exploitPatch(b.title),
					text = exploitPatch(b.text),
					short = exploitPatch(b.short),
					tags = Array.isArray(b['tags[]']) === false? [b['tags[]']] :	b['tags[]'],
					mask = createBitmask(tags),
					checked = gdps.checked,
					hasLgbt = gdps.hasLgbt,
					date = time(),
					data = [title,text,short,JSON.stringify(tags),mask,checked,hasLgbt,date,gdps.ID];
				const vac = await Vacans.addVac(data);
				return vac;
			}
		}
	});
}