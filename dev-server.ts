import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import generateArticle from './api/generate-article';
import generateImage from './api/generate-image';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.post('/api/generate-article', (req, res) => generateArticle(req as any, res as any));
app.post('/api/generate-image', (req, res) => generateImage(req as any, res as any));

app.get('/api/debug', (_req, res) => {
	const key = process.env.GOOGLE_API_KEY || '';
	res.json({ hasKey: Boolean(key), keyPrefix: key ? key.slice(0, 6) : '' });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(PORT, () => {
	console.log(`[dev-api] listening on http://localhost:${PORT}`);
});


