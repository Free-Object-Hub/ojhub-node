import { query, Gdps, Wikis, Vacans, Users, Auth } from './api.js';

export function createBitmask(tagIds) {
	let mask = 0n;
	for (const tagId of tagIds) {
		const id = parseInt(tagId, 10);
		if (id >= 1) {
			mask |= (1n << BigInt(id - 1));
		}
	}
	return mask;
}

export async function vacansAppliesReader(request, reply, vacansData) {
	await Auth.getUser(request, reply);
	if (!request.user)
		return vacansData;
	const uId = request.uId;

    if (!uId)
        return vacansData;

	if (vacansData.length == 0)
		return vacansData;

	const vacsIds = [];
	for (let v in vacansData)
		vacsIds.push(vacansData[v].ID);

	let quer = `SELECT vacId,ID FROM vacsApplies WHERE vacId IN (${vacsIds.map(()=>'?').join(',')}) AND userId = ?`,
		exec = [...vacsIds, uId];
    console.log(quer, exec);
    if (vacsIds.length === 0)
        return [];
	const appliesPre = await query(quer, exec);

	for (let e of appliesPre) {
		vacansData['v'+e.vacId].isApplied = e.ID;
	}

	return vacansData;
}

export async function NewGdpsFinder(method, channel, page, tags = [], oss = [], name = '') {
	method = parseInt(method);
	channel = parseInt(channel);
	page = parseInt(page);

	const parseClasses = {
		'-5':	(g)=>g.map(el => new Vacans(el)),
		'-2':	(g)=>g.map(el => new Gdps(el)),
		'-1':	(g)=>g.map(el => new Wikis(el)),
		'0':	(g)=>g.map(el => new Gdps(el)),
		'1':	(g)=>g.map(el => new Gdps(el)),
		'2':	(g)=>g.map(el => new Gdps(el))
	};

	let prep = "",
	exec = [];

	const defGdpsData = 'ID,g.title,g.channel,g.description,g.short,g.tags,g.os,g.mask,g.likes,g.disls,g.commsCount,g.author,g.username,g.img,g.ban,g.connectedWiki';
	switch (parseInt(channel)) {
		case -5:
			prep = "SELECT g.*, p.channel as gChannel, p.title as gTitle FROM vacans g LEFT JOIN gdpses p ON g.gdpsId = p.ID WHERE g.checked = 1";
			break;
		case -2:
			prep = `SELECT g.${defGdpsData} FROM gdpses g WHERE g.checked = 1`;
			break;
		case -1:
			prep = "SELECT g.* FROM wikis g WHERE g.checked = 1";
			break;
		case 0:
		case 1:
		case 2:
			prep = `SELECT g.${defGdpsData} FROM gdpses g WHERE g.checked = 1 AND g.channel = ?`;
			exec.push(channel);
			break;
	}

	if (name) {
		prep += " AND LOWER(g.title) LIKE LOWER(?)";
		exec.push(`%${name}%`);
	}

	const bitmask = createBitmask(tags.concat(oss));
	if (bitmask !== 0n) {
		prep += " AND (g.mask & ?) = ?";
		exec.push(bitmask.toString(), bitmask.toString());
	}

	switch (parseInt(method)) {
		case 0: prep += ' ORDER BY g.ID DESC';		break;
		case 1: prep += ' ORDER BY g.likes DESC';	break;
		case 2: prep += ' ORDER BY g.disls';		break;
		case 3: prep += ' ORDER BY g.points DESC';	break;
	}

	prep += " LIMIT 9";
	if (page && parseInt(page) != 0) {
		prep += " OFFSET ?";
		const offset = page * 8;
		exec.push(offset);
	}

	let gdpses = await query(prep, exec),
	gdpsesDone = parseClasses[channel.toString()](gdpses);
	return gdpsesDone;
}

export function liketype(type) {
	const mapping = {
		'0': ['gdpses', 0, 0],
		'1': ['texures', 0, 2],
		'2': ['news', 0, 6],
		'3': ['comments', 0, 1],		// gdpses
		'4': ['comments', 1, 4],		// texures
		'5': ['comments', 3, 4],		// news
		'6': ['comments', 2, 5],		// guidescomm
		'7': ['guides', 0, 7],
		'8': ['wikis', 0, 8],
		'9': ['forumPosts', 0, 9],
		'10': ['comments', 4, 10],		// forumPostComm
		'11': ['vacans', 0, 11],
		'12': ['comments', 5, 12]		// vacanscomm
	};
	
	return mapping[type?.toString()] || [
		'table',
		-1,	// commentsChannel
		-1	// likeChannel
	];
}

export const channelsCommsToLikes = {
	0: 1,
	1: 4,
	2: 5,
	3: 4,
	4: 10,
	5: 12
}

export async function checkLike(ID, userId, channel = 0) {
	let quer = 'SELECT ID, type FROM `likes` WHERE `whereIz` = ? AND `userId` = ? AND `channel` = ? LIMIT 1';
	let exec = [ID, userId, channel];

	const result = await query(quer, exec);

	if (result.length === 0) {
		return false;
	}
	return result[0];
}

export async function likeSet(ID, check, userId, isDisl = false) {
	let arg = ['+', -1, 'likes'];
	if (isDisl)
		arg = ['-', 1, 'disls'];
	let	quer1 = `UPDATE ${check[0]} SET ${arg[2]} = ${arg[2]} ${arg[0]} 1 WHERE ID = ?`,
		exec1 = [ID],
		quer2 = `INSERT INTO likes (whereIz, userId, type, channel) VALUES (?, ?, ?, ?)`,
		exec2 = [ID, userId, arg[1], check[2]];
	console.log(quer1, exec1);
	console.log(quer2, exec2);

	if (check[0] == 'comments') {
		quer1 += ' AND `channel` = ?';
		exec1.push(check[1])
	}

	const like1 = query(quer1, exec1);
	const like2 = query(quer2, exec2);
	await Promise.all([like1, like2]);
	const [ld] = await query(`SELECT likes, disls FROM ${check[0]} WHERE ID = ?`, [ID]);
		console.log(ld)
	return [ld.likes, ld.disls];
}
export async function removeLike(data, ID, where) {
	let q = '',
		c = '',
		likeAction = data.type;
	if (where[0] == 'comments')
		c = ' AND `channel` = ' + where[1];

	if (likeAction == -1) {
		likeAction = '- 1';
		q = `UPDATE ${where[0]} SET likes = likes ${likeAction} WHERE ID = ?${c}`;
	} else {
		likeAction = '+ 1';
		q = `UPDATE ${where[0]} SET disls = disls ${likeAction} WHERE ID = ?${c}`;
	}

	let quer3 = 'DELETE FROM `likes` WHERE ID = ?',
		exec3 = [data.ID];
	
	const delet = await query(quer3, exec3);

	if (delet.affectedRows != 0) {
		await query(q,[ID]);
		const [ld] = await query(`SELECT likes, disls FROM ${where[0]} WHERE ID = ?`, [ID]);
		console.log(ld)
		return [ld.likes, ld.disls];
	}
}
