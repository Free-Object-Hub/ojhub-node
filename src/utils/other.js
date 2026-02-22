import https from 'https';

export const HELPER_VER = 'BUILD_NODE_133';

export const HELPER_URL = 'https://objecthub.xyz/';

export function GDPSswitchChannel(channel) {
	const switcher = {
		[CH.PROJECT.CAMP]: 'c',
		[CH.PROJECT.SHOW]: 's',
		[CH.PROJECT.PERE]: 'p'
	};
	return switcher[channel]
};

export function time() {
	return Math.floor(Date.now() / 1000);
};

export async function TGwebhookLog(msg) {
	const message = `${msg}\n\n${HELPER_VER}`;
	const resp1 = false;
	
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
	
	const req = https.request(options, (res) => {
		// Читаем ответ, но не ждем его
		let data = '';
		res.on('data', (chunk) => {
			data += chunk;
		});
		res.on('end', () => {
			// Опционально: можно залогировать успешную отправку
			if (res.statusCode === 200) {
				console.log('TG log sent OK');
			} else {
				console.log('TG log status:', res.statusCode, data);
			}
		});
	});
	
	req.on('error', (e) => {
		// Тихий фейл - не логируем, если не нужно
		// console.error('TG log error:', e.message);
	});
	
	req.on('timeout', () => {
		req.destroy();
		// console.error('TG log timeout');
	});
	
	// Пишем данные и завершаем запрос
	req.write(postData);
	req.end();
	
	// Возвращаем сразу, не дожидаясь ответа
	return [resp1, null];
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
	}
};