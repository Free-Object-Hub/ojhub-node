import { Auth, Guides, Wikis } from "../../utils/api.js";

export async function guidesAdmin(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isWikiMy],
		handler: async (request, reply) => {
			const wId = request.query.wiki;
			const page = parseInt(request.query.page) || 0;

			const guides = await Guides.fetchByWiki(wId,page,false);

			const Json = [];
			for (const el of guides)
				Json.push(el.renderGuideMini());

			return Json;
		}
	});
}

export async function guideEdit(server, url) {
	server.route({
		method: ['GET'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isWikiMy],
		handler: async (request, reply) => {
			const gId = request.query.id;

			const guide = await	Guides.fetchById(gId);

			const Json = guide.renderGuide(request.wiki.colors)
			Json.guidedata = JSON.parse(Json.guidedata.replaceAll('\n','\\n'));

			return Json;
		}
	});
}

export async function guideEdit_(server, url) {
	server.route({
		method: ['POST'],
		url: url,
		preHandler: [Auth.requireDevice, Auth.isWikiMy],
		handler: async (request, reply) => {
			const gId = request.query.id;

			const guide = await Guides.fetchById(gId);

			const Json = guide.renderGuide(request.wiki.colors)
			Json.guidedata = JSON.parse(Json.guidedata.replaceAll('\n','\\n'));

			return Json;
		}
	});
}
