import { getOutlookEdition } from 'ua-parser-js/helpers';
import { GDPSswitchChannel, query, queryOne, CH, ramDB } from './api.js';

export class Comments {
	constructor(data = {}) {
		Object.assign(this, data);
	}

	COMMrender() {
		//const text = JSON.stringify(
		//	Buffer.from(this.text,'base64').toString('utf8')
		//).slice(1,-1);
		const text = Buffer.from(this.text,'base64').toString('utf8');

		return [
			this.ID,
			this.uNickname || this.uUsername || '???',
			text,
			this.userId,
			this.uPriority || 0,
			[
				this.likes,
				this.disls,
			],
			this.date,
			0//isLiked
		]
	}

	static async fetchById(ID) {
		const comm = await query('SELECT c.*, u.username as uUsername, u.nickname as uNickname, u.priority as uPriority FROM comments c '+
		'LEFT JOIN users u ON c.userId = u.userId '+
		'WHERE c.ID = ?', [ID]);
		return new Comments(comm[0]);
	}
	
	static async getComments(channel, gdpsId, page) {
		const offset = page * 10;
		let quer = 'SELECT c.*, u.username as uUsername, u.nickname as uNickname, u.priority as uPriority FROM comments c '+
		'LEFT JOIN users u ON c.userId = u.userId '+
		'WHERE c.whereIz = ? AND c.channel = ? ORDER BY c.ID DESC LIMIT 11 OFFSET ?',
		exec = [gdpsId+'', channel, offset];

		let comms = await query(quer, exec);
		return comms.map(el => new Comments(el));
	}

	static async getAllComments(channel, gdpsId) {		
		let sql = 'SELECT c.*, u.username as uUsername, u.nickname as uNickname, u.priority as uPriority FROM comments c '+
		'LEFT JOIN users u ON c.userId = u.userId '+
		'WHERE c.whereIz = ? AND c.channel = ? ORDER BY c.ID DESC',
		exec = [gdpsId, channel];

		let comms = await query(sql, exec);
		return comms.map(el => new Comments(el));
	}

	static async addComment(userId, ID, text, date = 0, channel = 0) {
		return await query(
			'INSERT INTO `comments` (`userId`, `whereIz`, `text`, `date`, `channel`) VALUES (?,?,?,?,?)',
			[userId, ID, text, date, channel]
		);
	}

	static async modifyComment(commId, text) {
		return await query('UPDATE `comments` SET `text` = ? WHERE `ID` = ?', [text, commId]);
	}

	static async deleteComm(ID, likeChannel) {
		return Promise.all([
			query('DELETE FROM `comments` WHERE `ID` = ?',[ID]),
			query('DELETE FROM `likes` WHERE `whereIz` = ? AND `channel` = ?',[ID, likeChannel])
		]);
	}
}

export class News {
	constructor(data = {}) {
		Object.assign(this, data);
	}

	NEWSrender() {
		const text = JSON.stringify(
			Buffer.from(this.text,'base64').toString('utf8')
		).slice(1,-1);
		const gdpsId = GDPSswitchChannel(this.gChannel)+this.gdpsId;

		return {
			ID: this.ID,
			title: this.title,
			text: text,
			author: this.userId,
			username: this.uNickname || this.uUsername || '???',
			gdpsId: gdpsId || 0,
			gdpsTitle: this.gTitle || '???',
			gdpsImg: this.gImg || '',
			date: this.date,
			likes: [
				this.likes,
				this.disls,
				this.commsCount
			],
			isLiked: 0,//$this->isLiked,
			hasFile: this.hasFile,
		}
	}

	static async fetchAllNews(page = 0) {
		let sql = 'SELECT n.*, u.username as uUsername, u.nickname as uNickname, g.title as gTitle, g.img as gImg, g.channel as gChannel '+
			'FROM news n LEFT JOIN users u ON n.userId = u.userId '+
			'LEFT JOIN gdpses g ON n.gdpsId = g.ID '+
			'ORDER BY n.ID DESC LIMIT 11',
			exec = [];
		if (typeof page == 'number' && page > 0) {
			sql += ' OFFSET ?';
			let page2 = page * 10;
			exec.push(page2)
		}
		const news = await query(sql, exec);
		const newsDone = news.map(el => new News(el));

		return newsDone;
	}

	static async fetchById(ID) {
		let sql = 'SELECT * FROM news WHERE ID = ?',
			exec = [ID];
		let news = await query(sql, exec);
		return news.map(el => new News(el));
	}

	static async fetchNews(gdpsId, page = 0) {
		let sql = 'SELECT n.*, u.username as uUsername, u.nickname as uNickname, g.title as gTitle, g.img as gImg, g.channel as gChannel '+
			'FROM news n LEFT JOIN users u ON n.userId = u.userId LEFT JOIN gdpses g ON n.gdpsId = g.ID '+
			'WHERE n.gdpsId = ? ORDER BY n.ID DESC LIMIT 11',
			exec = [gdpsId];
		if (typeof page == 'number' && page > 0) {
			sql += ' OFFSET ?';
			let page2 = page * 10;
			exec.push(page2)
		}
		let news = await query(sql, exec);
		return news.map(el => new News(el));
	}

	static async fetchById(ID) {
		let gCache = await ramDB.g('newsIdCache:'+ID);
		if (gCache)
			return new News(gCache);

		const news = await query('SELECT n.*, u.username as uUsername, u.nickname as uNickname, g.title as gTitle, g.img as gImg, g.channel as gChannel '+
			'FROM news n LEFT JOIN users u ON n.userId = u.userId LEFT JOIN gdpses g ON n.gdpsId = g.ID '+
			'WHERE n.ID = ?', [ID])

		if (!gCache) await ramDB.s('newsIdCache:'+ID, news[0]);

		return new News(news[0]);
	}

	static async NEWSpost(userId, ID, text, date = 0, title = '', checked = 0, hasFile = '') {
		const news = await query(
			'INSERT INTO news (userId, gdpsId, date, title, text, checked, hasFile) VALUES (?,?,?,?,?,?,?)',
			[userId, ID, date, title, text, checked, hasFile]
		)
		return news.insertId;
	}

	static async NEWSedit(ID, text, title, gdpsId) {
		const news = await query(
			'UPDATE `news` SET `text` = ?, `title` = ? WHERE `ID` = ? AND gdpsId = ?',
			[text, title, ID, gdpsId]
		)
		return news.affectedRows;
	}

	static async deleteNews(ID) {
		await query('DELETE FROM `likes` WHERE `whereIz` = ? AND `channel` = 6', [ID]);
		return await query('DELETE FROM `news` WHERE `ID` = ?', [ID]);
	}
}
