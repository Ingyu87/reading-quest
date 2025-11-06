import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = 'gemini-1.5-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}
	try {
		const { kind, difficulty, topic } = (req.body || {}) as { kind: '설명' | '의견'; difficulty: '상' | '중' | '하'; topic?: string };
		if (!kind || !difficulty) {
			res.status(400).json({ error: 'kind and difficulty are required' });
			return;
		}
		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			console.error('[generate-article] Missing GOOGLE_API_KEY');
			res.status(500).json({ error: 'Missing GOOGLE_API_KEY', details: { hasApiKey: false } });
			return;
		}
		console.log('[generate-article] Starting generation with key prefix:', apiKey.slice(0, 6));
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: MODEL });
		const prompt = `다음 조건에 맞는 초등 4학년 수준의 ${kind} 글을 작성하세요.\n- 주제: ${topic || '교과 적합한 일반 주제'}\n- 난이도: ${difficulty}\n- 분량: 5문단\n- 먼저 한 줄 제목을 쓰고, 이어서 본문을 작성하세요.\n- 제목은 [제목:]으로 시작, 본문은 [본문:]으로 시작해 주세요.`;
		console.log('[generate-article] Calling Gemini API...');
		const result = await model.generateContent(prompt);
		const text = result.response.text();
		console.log('[generate-article] Received response, length:', text.length);
		let title = '제목 미생성';
		let body = text;
		const titleMatch = text.match(/\[제목:\](.*)/);
		const bodyMatch = text.match(/\[본문:\]([\s\S]*)/);
		if (titleMatch) title = titleMatch[1].trim();
		if (bodyMatch) body = bodyMatch[1].trim();
		const imagePrompt = `${kind} 글 삽화, 주제: ${topic || '교과 일반'}, 난이도: ${difficulty}, 귀여운 일러스트, 밝은 색감`;
		const imageUrl = `https://placehold.co/800x480?text=${encodeURIComponent(title)}`;
		res.status(200).json({ title, body, imageUrl, imagePrompt });
	} catch (e: any) {
		console.error('[generate-article] error', e?.message || e, e?.stack);
		const errorMessage = e?.message || 'Generation failed';
		const hasKey = Boolean(process.env.GOOGLE_API_KEY);
		res.status(500).json({ 
			error: errorMessage,
			details: {
				hasApiKey: hasKey,
				keyPrefix: hasKey ? process.env.GOOGLE_API_KEY?.slice(0, 6) : 'missing',
				stack: process.env.NODE_ENV === 'development' ? e?.stack : undefined
			}
		});
	}
}



