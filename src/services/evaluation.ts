export interface EvaluateParams {
	question: string;
	stage: 'pre' | 'during' | 'post';
	articleTitle?: string;
	articleBody?: string;
}

export interface EvaluationResult {
	feedback: string;
}

export async function evaluateQuestion(params: EvaluateParams): Promise<EvaluationResult> {
	const res = await fetch('/api/evaluate-question', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data?.error || 'Failed to evaluate question');
	}
	return (await res.json()) as EvaluationResult;
}

export function downloadFeedback(feedback: string, nickname: string, question: string, stage: string) {
	const stageNames: Record<string, string> = {
		pre: '읽기 전',
		during: '읽기 중',
		post: '읽기 후',
	};
	const content = `질문 평가 피드백

학생: ${nickname}
단계: ${stageNames[stage] || stage}
질문: ${question}

${feedback}

---
생성일시: ${new Date().toLocaleString('ko-KR')}
`;

	const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `질문평가_${nickname}_${Date.now()}.txt`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

