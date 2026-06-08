import { ramDB, Guides, Wikis, Comments, WikiTemp } from "../../utils/api.js";

export async function guides(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			const wId = request.query.wiki;
			const page = parseInt(request.query.page) || 0;

			const cache = await ramDB.g('wikiPages:'+wId+'p'+page);
			if (cache)
				return cache;
			let awaits = [
				Guides.fetchByWiki(wId,page),
			];
			if (page == 0)
				awaits.push(Wikis.fetchById(wId))

			const [guides, wiki] = await Promise.all(awaits);

			const Json = [
			]
			if (wiki)
				Json.push({
					ID: wiki.ID,
					title: wiki.title,
					color: wiki.colors,
				})
			for (const el of guides)
				Json.push(el.renderGuideMini());

			await ramDB.s('wikiPages:'+wId+'p'+page, Json, 300);

			return Json;
		}
	});
}

export async function guide(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		handler: async (request, reply) => {
			const gId = request.query.id;

			const cache = await ramDB.g('guide:'+gId);
			if (cache)
				return cache;

			const [wiki, guide, comms] = await Promise.all([
				Wikis.fetchById(request.query.wiki),
				Guides.fetchById(gId),
				Comments.getComments(2,gId),
			]);

			const Json = Object.assign(
				guide.renderGuide(wiki.colors),
				{
					comments:{},
					templates:{},
				}
			); 

			if (guide.templates != '') {
				let templates = guide.templates.split(',');
				if (templates.length === 1) {
					let templatesDone = await WikiTemp.getOneTemplateByWiki(guide.wikiChannel, guide.templates);
					Json.templates[templatesDone.name] = templatesDone.renderTemplate();
				} else {
					let templatesDone = await WikiTemp.getTemplatesByWiki(guide.wikiChannel, templates);
					templatesDone.forEach(t=>{
						Json.templates[t.name] = t.renderTemplate();
					})
				}
			}
		

			for (const el of comms)
				Json.comments['c'+el.ID] = el.COMMrender();

			await ramDB.s('guide:'+gId, Json, 300);

			return Json;
		}
	});
}
