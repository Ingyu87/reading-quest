import type { VercelRequest, VercelResponse } from '@vercel/node';

// Uses Google AI Studio Images API (Imagen). Ensure the key has Images API access.
const IMAGE_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate';

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}
	try {
		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			res.status(500).json({ error: 'Missing GOOGLE_API_KEY' });
			return;
		}
		const { prompt, aspectRatio } = (req.body || {}) as { prompt: string; aspectRatio?: string };
		if (!prompt) {
			res.status(400).json({ error: 'prompt is required' });
			return;
		}
		const body = {
			prompt: { text: prompt },
			imageGenerationConfig: { numberOfImages: 1, aspectRatio: aspectRatio || '16:9' },
		};
		const r = await fetch(`${IMAGE_ENDPOINT}?key=${apiKey}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		if (!r.ok) {
			const t = await r.text();
			console.error('[generate-image] error', t);
			res.status(500).json({ error: `Imagen error: ${t}` });
			return;
		}
		const data: any = await r.json();
		// Try several likely shapes; fall back to placeholder
		let b64: string | null = null;
		if (data?.candidates?.[0]?.image?.base64) b64 = data.candidates[0].image.base64;
		if (!b64 && data?.generatedImages?.[0]?.image) b64 = data.generatedImages[0].image;
		if (!b64) {
			res.status(200).json({ imageUrl: `https://placehold.co/800x480?text=${encodeURIComponent('이미지 생성 실패')}` });
			return;
		}
		const imageUrl = `data:image/png;base64,${b64}`;
		res.status(200).json({ imageUrl });
	} catch (e: any) {
		console.error('[generate-image] error', e?.message || e);
		res.status(500).json({ error: e?.message || 'Image generation failed' });
	}
}



