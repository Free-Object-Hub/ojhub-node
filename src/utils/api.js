import { ramDB, getCity } from './db.js';
import { Users, Device } from './users.js';
import { Gdps, Wikis } from './gdpses.js';
import { News } from './comments.js';
import { NewGdpsFinder } from './search.js';
import { Alarms } from './alarms.js';
import { GDPSswitchChannel } from './other.js';

export { pool, query, queryOne, ramDB, getCity } from './db.js';
export { User, Users, Device } from './users.js';
export { Auth } from './auth.js';
export { Gdps, Owners, Content, Guides, Wikis, Vacans, Applies } from './gdpses.js';
export { Comments, News } from './comments.js';
export { NewGdpsFinder, createBitmask, vacansAppliesReader, liketype, channelsCommsToLikes, checkLike, likeSet, removeLike } from './search.js';
export { Alarms } from './alarms.js';
export { HELPER_VER, HELPER_URL, GDPSswitchChannel, time, validateEmail, TGwebhookLog, parseFormData, channelsObjsToComm, CH } from './other.js';
export { exploitPatch } from './security.js';

let failUser = {
	username: 'Object Hub',
	ID: 0,
	role: 0,
	isActive: 0,
	hasAlarms: 0,
	resume: '',
	socials: '',
	token: '',
	cityData: false
};

export async function loginToken(ip = '', token = '', device = '', showToken = false, ignoreDevice = false) {
	let Json = [{},[{},{}],{},{}],
		cacheCollection = [
			Promise.resolve(undefined),
			Promise.resolve(undefined)
		],
		userCache = [];
	const [ramDbUser, cacheSearch] = await Promise.all([
		ramDB.g('userTc:'+token),
		ramDB.g('loginTcache')
	]);

	if (cacheSearch) {
		Json[2] = cacheSearch[0];
		Json[3] = cacheSearch[1];
	} else
		cacheCollection = [
			NewGdpsFinder(3, -2, 0),
			News.fetchAllNews()
		];

	if (token) {
		if (ramDbUser) {
			const check = ignoreDevice ? true : await Device.easyCheckDevice(ramDbUser[0]['ID'], device);
			if (check) {
				Json[0] = ramDbUser[0];
				Json[1] = ramDbUser[1];
				if (showToken)
					Json[0]['token'] = token;
			} else Json[0] = failUser;
		} else {
			let user = ignoreDevice ? await Users.fetchByToken(token) : await Users.fetchByTokenAndDevice(token, device);
			if (user) {
				userCache = user;
				Json[0] = {
					username: user.getNickname(),
					ID: user.userId,
					role: user.priority,
					isActive: user.activated,
					resume: user.resume,
					socials: user.socials,
					cityData: getCity(ip), // [country, city|'unknown']
					hasAlarms: await Alarms.checkAlarms(user.userId)
				};
				if (showToken)
					Json[0]['token'] = token;
				cacheCollection.push(
					Gdps.getAllMyContent(user.userId),
					Wikis.getAllMyContent(user.userId)
				);
			} else Json[0] = failUser;
		}
	} else Json[0] = failUser;

	const [gdpsesPre, newsPre, myGdpses, myWikis] = await Promise.all(cacheCollection);

	if (!cacheSearch) {
		let gdpses = {};
		for (const el of gdpsesPre)
			gdpses[GDPSswitchChannel(el.channel)+el.ID] = el.GDPSrenderLT()
		Json[2] = gdpses;

		let news = {};
		for (const el of newsPre)
			news['n'+el.ID] = el.NEWSrender();
		Json[3] = news;
		await ramDB.s('loginTcache', [Json[2],Json[3]], 300);
	}

	if (!ramDbUser) {
		Json[0]['cityData'] = getCity(ip);
		if (Json[0].ID > 0) {
			myGdpses.flat().forEach(g=>{
				const gdps = new Gdps(g);
				Json[1][0][GDPSswitchChannel(gdps.channel)+gdps.ID] = gdps.GDPSrenderLT();
			});
			myWikis.flat().forEach(w=>{
				const wiki = new Wikis(w);
				Json[1][1]['w'+wiki.ID] = wiki.renderWikiAdmin();
			});
		}
		let ramDbJson = [Json[0], Json[1]];
		await Promise.all([
			ramDB.s('userTc:'+token, ramDbJson, 600),
			ramDB.s('userT:'+token, userCache, 600),
			ramDB.s('user:'+Json[0]['ID'], userCache, 600)
		])
	}

	return Json;
};