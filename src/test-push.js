import { sendToUser } from './utils/push.js';

await sendToUser(1, {
	title: 'Тест',
	body: 'Если видишь это — всё работает',
	url: '/'
});

console.log('отправлено');
process.exit(0);
