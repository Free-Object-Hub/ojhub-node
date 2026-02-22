import { Device, loginToken, Users, getCity } from '../../utils/api.js';
import { UAParser } from 'ua-parser-js';

async function verifyRecaptcha(recaptchaResponse, remoteIp) {
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
            console.log(b);
            const ua = request.headers['user-agent'] || request.headers['User-Agent'];

            const cap = await verifyRecaptcha(b['g-recaptcha-response'], request.ip);
            if (!cap.success)
                return '-3';
            const user = await Users.fetchByUsername(b.username);
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