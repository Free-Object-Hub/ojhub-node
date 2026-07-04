import { query, time } from './api.js';
import webpush from 'web-push';

webpush.setVapidDetails(
	process.env.VAPID_EMAIL,
	process.env.VAPID_PUBLIC_KEY,
	process.env.VAPID_PRIVATE_KEY
);

export async function saveSubscription(userId, deviceId, subscription, userAgent = null) {
	const { endpoint, keys } = subscription;
	await query(
		`INSERT INTO pushs (userId, deviceId, endpoint, p256dh, auth, userAgent, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
		userId = VALUES(userId),
		deviceId = VALUES(deviceId),
		p256dh = VALUES(p256dh),
		auth = VALUES(auth),
		userAgent = VALUES(userAgent)`,
		[userId, deviceId, endpoint, keys.p256dh, keys.auth, userAgent, time()]
	);
}

export async function removeSubscription(endpoint) {
	await query('DELETE FROM pushs WHERE endpoint = ?', [endpoint]);
}

export async function getSubsByUsers(userIds) {
	if (!userIds || userIds.length === 0) return [];

	const placeholders = userIds.map(() => '?').join(',');
	return query(`SELECT * FROM pushs WHERE userId IN (${placeholders})`, userIds);
}

export async function getSubscriptionsByUser(userId) {
	return query('SELECT * FROM pushs WHERE userId = ?', [userId]);
}

export async function getSubscriptionsByDevice(deviceId) {
	return query('SELECT * FROM pushs WHERE deviceId = ?', [deviceId]);
}

export async function sendToUser(userId, payload) {
	const subs = await getSubscriptionsByUser(userId);
	await Promise.all(subs.map(sub => sendToSubscription(sub, payload)));
}

async function sendToSubscription(sub, payload) {
	const pushSubscription = {
		endpoint: sub.endpoint,
		keys: { p256dh: sub.p256dh, auth: sub.auth }
	};
	try {
		await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
	} catch (err) {
		if (err.statusCode === 410 || err.statusCode === 404) {
			await removeSubscription(sub.endpoint);
		} else {
			console.error('push send error:', err.statusCode, err.body);
		}
	}
}
export default webpush;
