import type { VercelRequest, VercelResponse } from '@vercel/node';

// Uses Google AI Studio Imagen API via Vertex AI
const IMAGE_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages';

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}
	try {
		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			console.error('[generate-image] Missing GOOGLE_API_KEY');
			res.status(500).json({ error: 'Missing GOOGLE_API_KEY' });
			return;
		}
		const { prompt, aspectRatio } = (req.body || {}) as { prompt: string; aspectRatio?: string };
		if (!prompt) {
			res.status(400).json({ error: 'prompt is required' });
			return;
		}
		console.log('[generate-image] Generating image with prompt:', prompt.substring(0, 50));
		
		// Try Imagen API via Vertex AI
		const body = {
			prompt: prompt,
			numberOfImages: 1,
			aspectRatio: aspectRatio || '16:9',
		};
		
		const r = await fetch(`${IMAGE_ENDPOINT}?key=${apiKey}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		
		if (!r.ok) {
			const t = await r.text();
			console.error('[generate-image] API error:', r.status, t);
			// Fallback to placeholder if API fails
			res.status(200).json({ 
				imageUrl: `https://placehold.co/800x480?text=${encodeURIComponent('이미지 생성 중...')}`,
				error: `API returned ${r.status}: ${t.substring(0, 200)}`
			});
			return;
		}
		
		const data: any = await r.json();
		console.log('[generate-image] Response keys:', Object.keys(data));
		
		// Try different response shapes
		let b64: string | null = null;
		if (data?.generatedImages?.[0]?.base64EncodedString) {
			b64 = data.generatedImages[0].base64EncodedString;
		} else if (data?.images?.[0]?.base64EncodedString) {
			b64 = data.images[0].base64EncodedString;
		} else if (data?.candidates?.[0]?.image?.base64) {
			b64 = data.candidates[0].image.base64;
		}
		
		if (!b64) {
			console.warn('[generate-image] No base64 found in response, using placeholder');
			res.status(200).json({ 
				imageUrl: `https://placehold.co/800x480?text=${encodeURIComponent('이미지 생성 실패')}`,
				debug: 'No base64 in response'
			});
			return;
		}
		
		const imageUrl = `data:image/png;base64,${b64}`;
		res.status(200).json({ imageUrl });
	} catch (e: any) {
		console.error('[generate-image] error', e?.message || e, e?.stack);
		res.status(500).json({ 
			error: e?.message || 'Image generation failed',
			details: process.env.NODE_ENV === 'development' ? e?.stack : undefined
		});
	}
}



