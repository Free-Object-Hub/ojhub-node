import { Device, loginToken, Users, getCity, exploitPatch, validateEmail } from '../../utils/api.js';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';

async function verifyRecaptcha(recaptchaResponse, remoteIp) {
	return Promise.resolve({success:true});
	const url = 'https://www.google.com/recaptcha/api/siteverify';
	
	const params = new URLSearchParams({
		secret: process.env.RECAPTCHA,
		response: recaptchaResponse,
		remoteip: remoteIp
	});

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params.toString()
		});

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Recaptcha verification failed:', error);
		return { success: false, errorCodes: ['connection_failed'] };
	}
}

export function login(server, url) {
	server.route({
		method: 'POST',
		url: url,
		handler: async (request, reply) => {
			const b = request.body;
			const ua = request.headers['user-agent'] || request.headers['User-Agent'];

			const cap = await verifyRecaptcha(b['g-recaptcha-response'], request.ip);
			if (!cap.success)
				return '-3';
			let username = exploitPatch(b.username);
			const user = await Users.fetchByUsername(username);
			if (!user)
				return '-2';
			if (!user.verifyPassword(b.password))
				return '-1';

			const deviceData = await Device.easyCheckDevice(user.userId, b['device']);
			if (!deviceData) {
				const [country, city] = getCity(request.ip);

				const parser = new UAParser();
				const dd = parser.setUA(ua).getResult();
				const br = dd.browser;
				const os = dd.os;

				await Device.addDevice(
					user.userId,
					ua,
					request.ip,
					country,
					city, 
					os.name+' '+os.version, 
					br.name+' '+br.version, 
					b['device'], 
					b['deviceDynamic']
				);
			}
			return await loginToken(request.ip, user.token, b['device'], true);
		}
	});
}

export function register(server, url) {
	server.route({
		method: 'POST',
		url: url,
		handler: async (request, reply) => {
			const b = request.body;
			const ua = request.headers['user-agent'] || request.headers['User-Agent'];

			const cap = await verifyRecaptcha(b['g-recaptcha-response'], request.ip);
			if (!cap.success)
				return '-3';
			let username = exploitPatch(b.username),
				email = exploitPatch(b.email);

			if (!validateEmail(email))
				return '-1';
			const check = await Users.hasUsed(email, username);
			if (check > 0)
				return '-2';

			let token = crypto.createHash('sha256')
    			.update(Users.randomString(16) + username)
    			.digest('hex');

			let user = await Users.newUserToken(
				username,
				b.password,
				email,
				1,
				token
			);
			// [token, insertId]

			const deviceData = await Device.easyCheckDevice(user[1], b['device']);
			console.log(deviceData);
			if (!deviceData) {
				const [country, city] = await getCity(request.ip);

				const parser = new UAParser();
				const dd = parser.setUA(ua).getResult();
				const br = dd.browser;
				const os = dd.os;

				let resp = await Device.addDevice(
					user[1],
					ua,
					request.ip,
					country,
					city, 
					os.name+' '+os.version, 
					br.name+' '+br.version, 
					b['device'], 
					b['deviceDynamic']
				);
			console.log(resp);
			}
			return await loginToken(request.ip, user[0], b['device'], true);
		}
	});
}
