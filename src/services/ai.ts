export interface GenerateParams {
	kind: '설명' | '의견';
	difficulty: '상' | '중' | '하';
	topic?: string;
}

export interface GeneratedArticle {
	title: string;
	body: string;
	imageUrl: string;
	imagePrompt: string;
}

export async function generateArticle(params: GenerateParams): Promise<GeneratedArticle> {
	const res = await fetch('/api/generate-article', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params),
	});
	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		const errorMsg = errorData?.error || `HTTP ${res.status}: ${res.statusText}`;
		const details = errorData?.details ? `\n상세: ${JSON.stringify(errorData.details)}` : '';
		throw new Error(`${errorMsg}${details}`);
	}
	return (await res.json()) as GeneratedArticle;
}

export async function generateImage(prompt: string, aspectRatio: string = '16:9'): Promise<string> {
	const res = await fetch('/api/generate-image', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ prompt, aspectRatio }),
	});
	if (!res.ok) throw new Error('Failed to generate image');
	const data = await res.json();
	return data.imageUrl as string;
}


