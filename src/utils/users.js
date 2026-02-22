import { query, ramDB } from './api.js';
import bcrypt from 'bcryptjs';

export class User {
	constructor(data = {}) {
		Object.assign(this, data);
	}

	verifyPassword(password) {
		return bcrypt.compareSync(password, this.password);
	}

	getNickname() {
		return this.nickname || this.username;
	}

	renderPublic() {
		return {
			username: this.getNickname(),
			ID: this.userId || this.ID,
			role: this.priority,
			isActive: this.activated,
			resume: this.resume,
			socials: this.socials,
		};
	}

	async getDevices() {
		const userId = this.userId || this.ID
		const devices = await query('SELECT * FROM `devices` WHERE userId = ?', [userId]);
		return devices.map(el=>new Device(el));
	}
}

export class Device {
	constructor(data = {}) {
		Object.assign(this, data);
	}

	static async easyCheckDevice(userId, staticFp) {
		const data = await query('SELECT * FROM `devices` WHERE `userId` = ? AND `staticFp` = ?', [userId, staticFp]);
		return data.length > 0;
	}

	static async addDevice(userId, uAgent, ip, country, city, platform, browser, staticFp, dynamicFp) {
		const data = await query('INSERT INTO `devices` (`userId`, `userAgent`, `ip`, `country`, `city`, `platform`, `browser`, `staticFp`, `dynamicFp`) VALUES (?,?,?,?,?,?,?,?,?)', [userId, uAgent, ip, country, city, platform, browser, staticFp, dynamicFp]);
		return data.insertId > 0;
	}

	static async removeDevice(userId, deviceId) {
		const data = await query('DELETE FROM `devices` WHERE userId = ? AND ID = ?', [userId, deviceId]);
		return data.affectedRows > 0;
	}

	render() {
		return {
			userAgent: this.userAgent,
			country: this.country,
			city: this.city,
			platform: this.platform,
			browser: this.browser,
		};
	}
}

export class Users {
	static async fetchByToken(token) {
		let userC = await ramDB.g('userT:'+token);
		if (userC)
			return new User(userC);
		
		let user = await query('SELECT * FROM users WHERE token = ? LIMIT 1', [token]);
		if (!user || user.length === 0)
			return null;
		
		if (!userC) await ramDB.s('userT:'+token, user[0]);

		return new User(user[0]);
	}

	static async fetchByTokenAndDevice(token, device) {
		let user = await query('SELECT u.* FROM users u INNER JOIN devices d on d.userId = u.userId WHERE u.token = ? AND d.staticFp = ?', [token, device]);
		if (!user || user.length === 0)
			return null;
		return new User(user[0]);
	}

	static async fetchByUsername(username) {
		let user = await query('SELECT * FROM users WHERE username = ?', [username]);
		if (!user || user.length === 0)
			return null;
		return new User(user[0]);
	}

	static async fetchByEmail(email) {
		let user = await query('SELECT * FROM users WHERE mail = ?', [email]);
		if (!user || user.length === 0)
			return null;
		return new User(user[0]);
	}

	static async fetchById(userId) {
		let userC = await ramDB.g('user:'+userId);
		if (userC)
			return new User(userC);
		
		let user = await query('SELECT * FROM users WHERE userId = ?', [userId]);
		if (!user || user.length === 0)
			return null;
		
		if (!userC) await ramDB.s('user:'+userId, user[0]);

		return new User(user[0]);
	}

	static async setNickname(userId, name) {
		const userName = await Promise.all([
			query('UPDATE gdpses SET username = ? WHERE author = ?', [name, userId]),
			query('UPDATE forumPosts SET username = ? WHERE userId = ?', [name, userId]),
			query('UPDATE users SET nickname = ? WHERE userId = ?', [name, userId])
		]);
		return userName[2].affectedRows;
	}

	static async setResume(userId, resume) {
		const resume2 = await query('UPDATE users SET resume = ? WHERE userId = ?', [resume, userId]);
		return resume2.affectedRows;
	}

	static async setSocials(userId, socials) {
		const socials2 = await query('UPDATE users SET socials = ? WHERE userId = ?', [socials, userId]);
		return socials2.affectedRows;
	}


	static randomString(length) {
		return crypto.randomBytes(length).toString('hex').slice(0, length);
	}
}