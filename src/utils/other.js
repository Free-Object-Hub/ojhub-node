import https from 'https';

export const HELPER_VER = 'BUILD_NODE_133';

export const HELPER_URL = 'https://objecthub.xyz/';

export function GDPSswitchChannel(channel) {
	const switcher = {
		[CH.PROJECT.CAMP]: 'c',
		[CH.PROJECT.SHOW]: 's',
		[CH.PROJECT.PERE]: 'p',
		[CH.PROJECT.TELE]: 't'
	};
	return switcher[channel]
};

export function time() {
	return Math.floor(Date.now() / 1000);
};

export function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
export async function TGwebhookLog(msg) {
	const message = `${msg}\n\n${HELPER_VER}`;
	let resp1 = false;
	
	const postData = new URLSearchParams({
		chat_id: process.env.TG_NEWS_RESENDER,
		text: message
	}).toString();
	
	const options = {
		hostname: 'api.telegram.org',
		port: 443,
		path: `/${process.env.TG_BOT_TOKEN}/sendMessage`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(postData)
		},
		// Таймаут для предотвращения зависаний
		timeout: 5000
	};

	return new Promise(resolve=>{
		const req = https.request(options, (res) => {
			let data = '';
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				if (res.statusCode === 200) {
					console.log('TG log sent OK');
				} else {
					console.log('TG log status:', res.statusCode, data);
				}
				resp1 = res.statusCode;
			});
		});
		
		req.on('error', (e) => {});
		
		req.on('timeout', () => {
			req.destroy();
		});
		
		req.write(postData);
		req.end();
		});
};

export async function parseFormData(parts) {
    const files = {};
    const body = {};
    
    for await (const part of parts) {
        if (part.type === 'file') {
            const buffer = await part.toBuffer();
            files[part.fieldname] = {
                buffer,
                filename: part.filename,
                mimetype: part.mimetype,
            };
        } else {
            // Обработка текстовых полей с поддержкой массивов
            if (Array.isArray(body[part.fieldname])) {
                body[part.fieldname].push(part.value);
                continue;
            }
            if (body[part.fieldname]) {
                body[part.fieldname] = [body[part.fieldname], part.value];
                continue;
            }
            body[part.fieldname] = part.value;
        }
    }
    
    return [body, files];
}

export const channelsObjsToComm = {
	0: 1,
}

export const CH = {
	PROJECT: {
		CAMP: 0,
		SHOW: 1,
		PERE: 2,
		TELE: 3,
	},
	WIKI: -1,
	GUIDE: -2,
	FORUM: -3,
	VACAN: -5,
};
