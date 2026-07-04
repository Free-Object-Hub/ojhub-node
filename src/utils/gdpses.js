import { applies } from '../endpoints/vacans/applies.js';
import { ramDB, query, Users, User } from './api.js';

export class Gdps {
	constructor(data = {}) {
		Object.assign(this, data);
	}

	// тс лучше
	GDPSrender(fullText = false, userId = 0) {
		const text = fullText
			? this.description
			: (this.short ?? this.description.substring(0, 121));

		let links = this.link;
		if (links.includes('\\"'))
			links = links.replace(/\\"/g, '"');
		if (links.startsWith('{'))
			try {
				links = JSON.parse(links);
			} catch(e) {
				links = links;
			}

		return {
			ID: this.ID,
			title: this.title,
			text: text,
			links: links,
			tags: this.tags,
			os: this.os,
			likes: [
				this.likes,
				this.disls,
				this.commsCount
			],
			author: this.author,
			username: this.username,
			img: this.img,
			ban: this.ban,
			freejoin: this.freejoin,
			language: this.language,
			checked: this.checked,
			points: this.points,
			wiki: this.connectedWiki
		};
	}

	GDPSrenderLT(userId = 0) {
		const text = this.description.substring(0, 121);
		return {
			ID: this.ID,
			title: this.title,
			text: text,
			tags: this.tags,
			os: this.os,
			likes: [
				this.likes,
				this.disls,
				this.commsCount
			],
			author: this.author,
			username: this.username,
			img: this.img,
			ban: this.ban,
			channel: this.channel,
			wiki: this.connectedWiki
		};
	}

	static async fetchById(ID) {
		let gCache = await ramDB.g('gdpsIdCache:'+ID);
		if (gCache)
			return new Gdps(gCache);

		const gdps = await query('SELECT * FROM `gdpses` WHERE `ID` = ?', [ID]);

		if (!gCache) await ramDB.s('gdpsIdCache:'+ID, gdps[0], 300);

		return new Gdps(gdps[0]);
	}

	static async fetchGdpsWithPerms(gdpsId, userId) {
		const gdps = await query(`SELECT g.*, CASE 
			WHEN g.author = ? THEN 2
			WHEN EXISTS				(SELECT 1 FROM soowners so WHERE so.gdpsId = g.ID AND so.userId = ?) THEN 1
			ELSE 0 END as perms
			FROM gdpses g WHERE g.ID = ?`,
			[userId, userId, gdpsId]
		);
		return gdps[0];
	}
	
	static async getAllMyContent(userId) {
		let allGdpses = await query(
			`SELECT g.*, CASE WHEN g.author = ? THEN 'owner' WHEN so.userId IS NOT NULL THEN 'soowner' END as role FROM gdpses g `+
			`LEFT JOIN soowners so ON g.ID = so.gdpsId AND so.userId = ? WHERE g.author = ? OR so.userId IS NOT NULL`,
			[userId, userId, userId]
		);

		const ownedGdps = [];
		const soownGdps = [];

		allGdpses.forEach(gdps => {
			const role = gdps.role;
			delete gdps.role;

			if (role === 'owner')
				ownedGdps.push(gdps);
			else if (role === 'soowner')
				soownGdps.push(gdps);
		});

		return [ownedGdps, soownGdps];
	}

	static async checkItem(userId, ID) {
		const result = await query(`SELECT CASE 
			WHEN EXISTS(SELECT 1 FROM gdpses WHERE ID = ? AND author = ?) THEN 2
			WHEN EXISTS(SELECT 1 FROM soowners WHERE gdpsId = ? AND userId = ?) THEN 1
			ELSE 0
		END as access_level LIMIT 1`, [ID, userId, ID, userId]);

		return result[0]?.access_level || 0;
	}

	static async addGdps(data) {
		const gdps = await query('INSERT INTO `gdpses` (`channel`, `title`, `link`, `img`, `ban`, `description`, `short`, `tags`, `os`, `mask`, `author`, `username`, `language`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', data);
		return gdps.insertId;
	}

	static async editGdps(data) {
		const gdps = await query('UPDATE `gdpses` SET `title` = ?, `link` = ?, `img` = ?, `ban` = ?, `description` = ?, `short` = ?, `tags` = ?, `os` = ?, `mask` = ?, `language` = ?, `checked` = 0, `editCount` = `editCount` + 1 WHERE `gdpses`.`ID` = ?', data);
		return gdps.affectedRows;
	}
	
	static async refreshAvatar(gdpsId, img, ban) {
		return await query('UPDATE `gdpses` SET `img` = ?, `ban` = ? WHERE `gdpses`.`ID` = ?', [img, ban, gdpsId]);
	}

	static async sub(userId, gdpsId) {
		await query(
			`INSERT INTO gdpsSubs (userId, gdpsId, date) VALUES (?, ?, ?)
			ON DUPLICATE KEY UPDATE date = date`,
			[userId, gdpsId, time()]
		);
	}

	static async unsub(userId, gdpsId) {
		await query('DELETE FROM gdpsSubs WHERE userId = ? AND gdpsId = ?', [userId, gdpsId]);
	}

	static async isSub(userId, gdpsId) {
		const rows = await query('SELECT ID FROM gdpsSubs WHERE userId = ? AND gdpsId = ?', [userId, gdpsId]);
		return rows.length > 0;
	}

	static async getSubs(gdpsId) {
		return query('SELECT userId FROM gdpsSubs WHERE gdpsId = ?', [gdpsId]);
	}

	static async getSubsByUsers(userIds) {
		if (!userIds || userIds.length === 0) return [];

		const placeholders = userIds.map(() => '?').join(',');
		return query(`SELECT * FROM gdpsSubs WHERE userId IN (${placeholders})`, userIds);
	}
}

export class Owners {
	static async fetchOwners(id, type) {
		let quer = '',
			exec = [];
		if (type >= 0) {
			quer = 'SELECT o.*, u.nickname, u.username FROM soowners o '+
			'INNER JOIN users u ON u.userId = o.userId '+
			'WHERE o.gdpsId = ? AND o.channel = ? ORDER BY o.ID DESC'
			exec = [id, type]
		} else {
			quer = 'SELECT o.*, u.nickname, u.username FROM wikisoowners o '+
			'INNER JOIN users u ON u.userId = o.userId '+
			'WHERE o.wikiId = ? ORDER BY o.ID DESC'
			exec = [id]
		}
		let ownPre = await query(quer, exec),
			owners = {};
		if (!ownPre || ownPre.length === 0)
			return {};
		for (const e of ownPre)
			owners[e.userId] = e;
		return owners;
	}

	static async addOwner(id, userId, type) {
		let quer = '',
			exec = [];
		if (type >= 0) {
			quer = 'INSERT INTO soowners (gdpsId, userId, channel) VALUES (?,?,?)'
			exec = [id, userId, type]
		} else {
			quer = 'INSERT INTO wikisoowners (wikiId, userId) VALUES (?,?)'
			exec = [id, userId]
		}
		let ownPre = await query(quer, exec);
		return ownPre.insertId;
	}

	static async deleteOwner(id, userId, type) {
		let quer = '',
			exec = [];
		if (type >= 0) {
			quer = 'DELETE FROM soowners WHERE gdpsId = ? AND userId = ? AND channel = ?'
			exec = [id, userId, type]
		} else {
			quer = 'DELETE FROM wikisoowners WHERE wikiId = ? AND userId = ?'
			exec = [id, userId]
		}
		let ownPre = await query(quer, exec);
		return ownPre.affectedRows;
	}
}

export class Content {}

export class Guides {
	constructor(data = {}) {
		Object.assign(this, data);
	}

	renderGuide(wikiColor = '') {
		return {guideinfo:
			[
				this.ID,
				this.title,
				this.aftertext,
				this.wikiTag,
				wikiColor
			],
			guidedata: this.guidetext,
		}
	}

	renderGuideMini() {
		return [
			this.ID,
			this.title,
			this.language,
			this.date,
			[
				this.likes,
				this.disls,
				this.commsCount
			],
			this.img,
			this.wikiTag
		];
	}

	renderGuideLT() {
		return {guideinfo:
			[
				this.ID,
				this.title,
				this.aftertext,
				this.language,
				this.img
			],
			guidedata: this.guidetext
		}
	}

	static async fetchByWiki(wikiId, page = 0, pohuiDostawai = true) {
		const offset = page * 8;
		let sql = `SELECT * FROM guides WHERE ${pohuiDostawai ? 'checked = 1 AND' : ''} wikiChannel = ? ORDER BY ID DESC LIMIT 9 OFFSET ?`,
		exec = [wikiId, offset];
		let guides = await query(sql, exec);
		return guides.map(el => new Guides(el));
	}

	static async fetchById(ID) {
		let guid = await query('SELECT * FROM `guides` WHERE `ID` = ?', [ID]);
		return new Guides(guid[0]);
	}

	static async fetchWikiWithPerms(gdpsId, userId) {
		const gdps = await query(`SELECT g.*, CASE 
			WHEN g.author = ? THEN 2
			WHEN EXISTS				(SELECT 1 FROM soowners so WHERE so.gdpsId = g.ID AND so.userId = ?) THEN 1
			ELSE 0 END as perms
			FROM gdpses g WHERE g.ID = ?`,
			[userId, userId, gdpsId]
		);
		return gdps[0];
	}
	
	static async uploadGuide(userId, title, aftertext, guidetext, language, img, date) {
		const guid = await query(
			'INSERT INTO `guides` (`userId`, `title`, `aftertext`, `guidetext`, `language`, `date`, `img`) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[userId, title, aftertext, guidetext, language, date, img]
		);
		return guid.insertId;
	}

	static async editGuide(userId, title, aftertext, guidetext, language, img, guidID) {
		const guid = await query(
			'UPDATE `guides` SET `checked` = 0, `userId` = ?, `title` = ?, `aftertext` = ?, `guidetext` = ?, `language` = ?, `img` = ? WHERE `ID` = ?',
			[userId, title, aftertext, guidetext, language, img, guidID]
		);
		return guidID;
	}
}

export class Wikis {
	constructor(data = {}) {
		Object.assign(this, data);
	}
	
	getMainPage() {
		if (this.mainWiki === 0)
			return 0;
		let guide = Guides.fetchById(this.mainWiki);
		if (guide.checked === 1)
			return this.mainWiki;
		return 0;
	}

	renderWiki() {
		return {
			ID: this.ID,
			title: this.title,
			text: this.text,
			ban: this.img,
			language: this.language,
			date: this.date,
			likes: [
				this.likes,
				this.disls
			],
			forumId: this.forumId,
			mainWiki: this.mainWiki
		};
	}

	renderWikiAdmin() {
		return {
			ID: this.ID,
			title: this.title,
			text: this.text,
			ban: this.img,
			language: this.language,
			date: this.date,
			likes: [
				this.likes,
				this.disls
			],
			userId: this.userId,
			connGdps: this.connectedGdps,
			forumId: this.forumId,
			mainWiki: this.mainWiki,
			color: this.colors,
		};
	}

	static async fetchWikiWithPerms(gdpsId, userId) {
		const gdps = await query(`SELECT g.*, CASE 
			WHEN g.userId = ? THEN 2
			WHEN EXISTS				(SELECT 1 FROM wikisoowners so WHERE so.wikiId = g.ID AND so.userId = ?) THEN 1
			ELSE 0 END as perms
			FROM wikis g WHERE g.ID = ?`,
			[userId, userId, gdpsId]
		);
		return gdps[0];
	}

	static async fetchById(ID) {
		let gCache = await ramDB.g('wikiIdCache:'+ID);
		if (gCache)
			return new Wikis(gCache);

		const wiki = await query('SELECT * FROM `wikis` WHERE `ID` = ?', [ID]);

		if (!gCache) await ramDB.s('wikiIdCache:'+ID, wiki[0], 300);

		return new Wikis(wiki[0]);
	}

	static async getAllMyContent(userId) {
		let allWikis = await query(
			`SELECT g.*, CASE WHEN g.userId = ? THEN 'owner' WHEN so.userId IS NOT NULL THEN 'soowner' END as role FROM wikis g `+
			`LEFT JOIN wikisoowners so ON g.ID = so.wikiId AND so.userId = ? WHERE g.userId = ? OR so.userId IS NOT NULL`,
			[userId, userId, userId]
		);

		const ownedWikis = [];
		const soownWikis = [];

		allWikis.forEach(wiki => {
			const role = wiki.role;
			delete wiki.role;

			if (role === 'owner')
				ownedWikis.push(wiki);
			else if (role === 'soowner')
				soownWikis.push(wiki);
		});

		return [ownedWikis, soownWikis];
	}
}

export class WikiTemp {
	/*
	public int $ID;
	public int $wikiId;
	public string $name;
	public string $args;
	public string $method;
	public string $content;
	*/
	constructor(data = {}) {
		Object.assign(this, data);
	}

	static async getOneTemplateByWiki(wikiId, template) {
		let sql = await query('SELECT * FROM `wikiTemplates` WHERE `wikiId` = ? AND name = ?', [wikiId, template]);

		return new WikiTemp(sql[0]);
	}

	static async getTemplatesByWiki(wikiId, templates) {
		let sql = 'SELECT * FROM `wikiTemplates` WHERE `wikiId` = ? AND name IN (',
		exec = [wikiId],
		query2 = [];
		templates.forEach(t=>{
			query2.push('?')
			exec.push(t)
		});
		let doneSql = sql + query2.join(',') + ')';

		let data = await query(doneSql, exec);
		return data.map(e=> new WikiTemp(e));
	}

	static async getAllTemplatesByWiki(wikiId, page = 0) {
		let sql = 'SELECT * FROM `wikiTemplates` WHERE `wikiId` = ? ORDER BY `ID` DESC LIMIT 11',
		exec = [wikiId];
		if (page !== 0) {
			let page2 = page * 10;
			sql += ' OFFSET '+page2;
		}

		let data = await query(sql, exec);
		return data.map(e=> new WikiTemp(e));
	}

	static async saveTemplate(wikiId, name, args, method, content) {
		let currentTemp = await query('SELECT * FROM `wikiTemplates` WHERE `wikiId` = ? AND `name` = ?', [wikiId, name]),
		ID = currentTemp[0] ? currentTemp[0].ID : false,
		sql = 'UPDATE `wikiTemplates` SET `args` = ?, `method` = ?, `content` = ? WHERE `wikiId` = ? AND `name` = ?',
		exec = [args, method, content, wikiId, name];
		if (!ID)
			sql = 'INSERT INTO `wikiTemplates` (`args`, `method`, `content`, `wikiId`, `name`) VALUES (?,?,?,?,?)';
		await query(sql, exec);

		let data = await query('SELECT * FROM `wikiTemplates` WHERE `wikiId` = ? AND `name` = ?', [wikiId, name]);
		return new WikiTemd(data);
	}

	static async deleteTemplate(wikiId, template) {
		let data = await query('DELETE FROM `wikiTemplates` WHERE `wikiId` = ? AND name = ?', [wikiId, template])
		return data;
	}

	renderTemplate() {
		console.log(this);
		return [
			JSON.parse(this.args),
			this.content,//.replace(/\n/g, "\n"),
			this.method
		];
	}
}

export class Vacans {
	constructor(data = {}) {
		Object.assign(this, data);
	}

	renderVacan(userId = 0) {
		let applied = 0;
		if (userId != 0 && this.applied)
			applied = this.applied;

		return {
			ID: this.ID,
			title: this.title,
			tags: this.tags,
			text: this.text,
			short: this.short,
			date: this.date,
			isApplied: applied,
			likes: [
				this.likes,
				this.disls,
				this.commsCount
			],
			gId: this.gdpsId,
			gChannel: this.gChannel,
			gTitle: this.gTitle
		};
	}

	renderVacanMini(userId = 0) {
		let applied = 0;
		if (userId != 0 && this.applied)
			applied = this.applied;

		let text = this.short;
		if (text === '')
			text = this.text.substring(0, 121);

		return {
			ID: this.ID,
			title: this.title,
			tags: this.tags,
			text: text,
			date: this.date,
			isApplied: applied,
			likes: [
				this.likes,
				this.disls,
				this.commsCount
			],
			gId: this.gdpsId,
			gChannel: this.gChannel,
			gTitle: this.gTitle
		};
	}

	static async fetchById(ID) {
		let gCache = await ramDB.g('vacsIdCache:'+ID);
		if (gCache)
			return new Vacans(gCache);

		const gdps = await query('SELECT * FROM `vacans` WHERE `ID` = ?', [ID]);

		if (!gCache) await ramDB.s('vacsIdCache:'+ID, gdps[0], 300);

		return new Vacans(gdps[0]);
	}

	static async fetchVacanById(vacId, userId = 0) {
		const vac = await query('SELECT v.*, p.channel as gChannel, p.title as gTitle FROM vacans v LEFT JOIN gdpses p ON v.gdpsId = p.ID WHERE v.ID = ?', [vacId]);
		return new Vacans(vac[0]);
	}

	static async fetchVacansByGdps(gdpsId, userId, isAdmin = false, page = 0) {
		let applied = '',
			applied2 = '',
			admin = '',
			offset = '',
			exec = [],
			offsetInt = page * 8

		if (offsetInt > 0) {
			offset = ' OFFSET ?';
			exec.push(offsetInt);
		}

		if (userId != 0 && isAdmin == false) {
			applied = ', a.ID as applied';
			applied2 = ' LEFT JOIN vacsApplies a ON v.ID = a.vacId AND a.userId = ?';
			exec.push(userId);
		}
		if (isAdmin == false)
			admin = ' v.checked = 1 AND';

		let quer = `SELECT v.*${applied} FROM vacans v${applied2} WHERE${admin} v.gdpsId = ? LIMIT 9${offset}`;
		exec.push(gdpsId);

		const vacsPre = await query(quer, exec);
		return vacsPre.map(v=>new Vacans(v));
	}

	static async addVac(data) {
		const vac = await query('INSERT INTO `vacans` (`title`, `text`, `short`, `tags`, `mask`, `checked`, `hasLgbt`, `date`, `gdpsId`) VALUES (?,?,?,?,?,?,?,?,?)', data);
		return vac.insertId;
	}

	static async editVac(data) {
		const vac = await query('UPDATE `vacans` SET `title` = ?, `text` = ?, `short` = ?, `tags` = ?, `mask` = ?, `checked` = ?, `hasLgbt` = ? WHERE `gdpsId` = ? AND `ID` = ?', data);
		return vac.affectedRows;
	}

	static async removeVac(vacId) {
		const apl = query('DELETE FROM `vacsApplies` WHERE `vacId` = ?', [vacId]);
		const vac = query('DELETE FROM `vacans` WHERE `ID` = ?', [vacId]);
		const data = await Promise.all([
			vac, apl
		])
		return data[0].affectedRows;
	}
}

export class Applies {
	constructor(data = {}) {
		Object.assign(this, data);
	}

	renderApply() {
		let apl = {
			ID: this.ID,
			vacId: this.vacId,
			userId: this.userId,
			username: this.uNickname || this.uUsername || '???',
			resume: this.uResume || '',
			date: this.date,
			status: this.status,
		};
		return apl;
	}

	static async checkApply(vacId, userId) {
		const apply = await query('SELECT ID FROM `vacsApplies` WHERE `vacId` = ? AND `userId` = ? LIMIT 1', [vacId, userId]);
		if (apply[0])
			return apply[0];
		else 
			return false;
	}

	static async fetchApplies(vacId, page = 0) {
		let quer = `SELECT a.*, u.username as uUsername, u.nickname as uNickname, u.resume as uResume 
			FROM vacsApplies a
    	    JOIN users u ON a.userId = u.userId
			WHERE a.vacId = ? LIMIT 11`,
			exec = [vacId];
		if (page !== 0) {
			let offset = page * 10;
			quer += ' OFFSET ?';
			exec.push(offset);
		}
		const apls = await query(quer, exec);
		return apls.map(a=>new Applies(a));
	}

	static async applyVac(data) {
		const data2 = await query('INSERT INTO `vacsApplies` (`vacId`, `userId`, `date`) VALUES (?,?,?)', data);
		return data2.insertId;
	}

	static async removeApl(aplId) {
		const data = await query('DELETE FROM `vacsApplies` WHERE `ID` = ?', [aplId]);
		return data.affectedRows;
	}

	static async removeAplsByUser(userId, aplId) {
		const data = await query('DELETE FROM `vacsApplies` WHERE `userId` = ? AND ID = ?', [userId, aplId]);
		return data.affectedRows;
	}
}
