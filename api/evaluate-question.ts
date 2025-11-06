import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = 'gemini-1.5-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}
	try {
		const { question, stage, articleTitle, articleBody } = (req.body || {}) as {
			question: string;
			stage: 'pre' | 'during' | 'post';
			articleTitle?: string;
			articleBody?: string;
		};
		if (!question) {
			res.status(400).json({ error: 'question is required' });
			return;
		}
		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			console.error('[evaluate-question] Missing GOOGLE_API_KEY');
			res.status(500).json({ error: 'Missing GOOGLE_API_KEY' });
			return;
		}
		console.log('[evaluate-question] Evaluating question for stage:', stage);
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: MODEL });
		
		const stageNames = {
			pre: '읽기 전',
			during: '읽기 중',
			post: '읽기 후',
		};
		
		const prompt = `초등학교 4학년 학생이 작성한 질문을 평가하고 피드백을 제공해주세요.

**학생의 질문:**
${question}

**질문 단계:** ${stageNames[stage]}

${articleTitle ? `**글 제목:** ${articleTitle}` : ''}
${articleBody ? `**글 본문:** ${articleBody.substring(0, 500)}...` : ''}

다음 형식으로 평가 피드백을 작성해주세요:

**1. 질문의 장점**
- (질문의 좋은 점 2-3가지)

**2. 개선 제안**
- (더 나은 질문을 만들기 위한 제안 1-2가지)

**3. 평가 점수**
- 이해도: ⭐⭐⭐⭐⭐ (5점 만점)
- 창의성: ⭐⭐⭐⭐⭐ (5점 만점)
- 적절성: ⭐⭐⭐⭐⭐ (5점 만점)

**4. 격려 메시지**
- (학생을 격려하는 따뜻한 메시지)`;

		console.log('[evaluate-question] Calling Gemini API...');
		const result = await model.generateContent(prompt);
		const feedback = result.response.text();
		console.log('[evaluate-question] Received feedback, length:', feedback.length);
		
		res.status(200).json({ feedback });
	} catch (e: any) {
		console.error('[evaluate-question] error', e?.message || e, e?.stack);
		const errorMessage = e?.message || 'Evaluation failed';
		res.status(500).json({
			error: errorMessage,
			details: process.env.NODE_ENV === 'development' ? e?.stack : undefined,
		});
	}
}

