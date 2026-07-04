import { query, queryOne, Users, sendToUser } from './api.js';

export class Alarms {
	constructor(data = {}) {
		Object.assign(this, data);
	}

	renderMini() {
		return [
			this.ID,
			this.title,
			this.public
		];
	}

	render() {
		return {
			ID: this.ID,
			title: this.title,
			text: this.text?.replaceAll("\n",'\\n'),
			date: this.date,
			adminName: this.adminName,
			adminId: this.adminId,
		};
	}

	static async checkAlarms(userId) {
		const id = await query('SELECT ID FROM `alarms` WHERE `userId` = ? AND `public` = 1 LIMIT 1', [userId]);
		if (id.length) return 1;
		else return 0;
	}

	static async updateAlarm(ID) {
		const alarm = await query('UPDATE alarms SET public = 2 WHERE ID = ?', [ID]);
		return alarm.affectedRows;
	}

	static async getFullAlarm(ID) {
		const alarm = await query('SELECT * FROM alarms WHERE ID = ?', [ID]);
		return new Alarms(alarm[0]);
	}

	static async getAlarmsList(userId, isAdmin, page) {
		const offset = page * 10;
		let admText = ' OR `userId` = 0';
		if (isAdmin == 0)
			admText = '';
		const quer = 'SELECT * FROM alarms WHERE public != 0 AND (userId = ?'+admText+') ORDER BY date DESC LIMIT 11 OFFSET ?';
		const exec = [userId, offset];
		let alarms = await query(quer, exec);
		return alarms.map(el => new Alarms(el));
	}

	static async removeAlarm(ID) {
		const result = await query('UPDATE `alarms` SET `public` = 0 WHERE `ID` = ?',[ID]);
		return result.affectedRows;
	}

	static async fullWrite(title, text, userId, date, adminId) {
		let uName = 'Object Hub'
		if (adminId !== 0) {
			let a = await Users.fetchById(adminId);
			uName = a.nickname || a.username;
		}
		const alarmId = await Alarms.writeAlarm(title, text, userId, date, uName, adminId);
	
		sendToUser(userId, { title, body: text.slice(0, 100), url: '/?alarms' })
			.catch(err => console.error('alarm push failed', err));
	
		return alarmId;
	}

	static async writeAlarm(title, text, userId, date, adminName, adminId) {
		let data = await query(
			'INSERT INTO `alarms` (`title`, `text`, `userId`, `date`, `adminName`, `adminId`) VALUES (?, ?, ?, ?, ?, ?)',
			[title, text, userId, date, adminName, adminId]
		);
		return data.insertId;
	}
}
