import type { RequestHandler } from 'express';

export const corsMiddleware: RequestHandler = (req, res, next) => {
	// Allow all origins for iframe embedding and API access
	const origin = req.headers.origin || '*';
	res.header('Access-Control-Allow-Origin', origin);
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization, push-ref, browser-id',
	);

	if (req.method === 'OPTIONS') {
		res.writeHead(204).end();
	} else {
		next();
	}
};
