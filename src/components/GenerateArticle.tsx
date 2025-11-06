import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateArticle, generateImage } from '../services/ai';
import { saveArticle } from '../services/articles';
import { useApp } from '../state/AppContext';

export default function GenerateArticle() {
	const nav = useNavigate();
	const { setArticleId } = useApp();
	const [kind, setKind] = React.useState<'설명' | '의견'>('설명');
	const [difficulty, setDifficulty] = React.useState<'상' | '중' | '하'>('중');
	const [topic, setTopic] = React.useState('');
    const [preview, setPreview] = React.useState<{ title: string; body: string; imageUrl: string } | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [imgLoading, setImgLoading] = React.useState(false);

	async function onGenerate() {
		setLoading(true);
		try {
			const g = await generateArticle({ kind, difficulty, topic });
            setPreview({ title: g.title, body: g.body, imageUrl: g.imageUrl });
		} finally {
			setLoading(false);
		}
	}

    async function onGenerateImage() {
        if (!preview) return;
        setImgLoading(true);
        try {
            const prompt = `${kind} 글 삽화, 주제: ${topic || preview.title}, 초등 4학년, 밝은 색감, 친근한 스타일`;
            const url = await generateImage(prompt, '16:9');
            setPreview({ ...preview, imageUrl: url });
        } finally {
            setImgLoading(false);
        }
    }

	async function onSaveAndStart() {
		if (!preview) return;
		const id = await saveArticle({ kind, difficulty, topic, title: preview.title, body: preview.body, imageUrl: preview.imageUrl });
		setArticleId(id);
		nav('/flow/pre');
	}

	return (
		<div style={{ padding: 24 }}>
			<h2>AI 글 생성</h2>
			<div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
				<label>글 종류:
					<select value={kind} onChange={e => setKind(e.target.value as any)}>
						<option value="설명">설명</option>
						<option value="의견">의견</option>
					</select>
				</label>
				<label>난이도:
					<select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}>
						<option value="상">상</option>
						<option value="중">중</option>
						<option value="하">하</option>
					</select>
				</label>
				<label>주제(선택):
					<input value={topic} onChange={e => setTopic(e.target.value)} placeholder="예: 우주" />
				</label>
				<div>
					<button onClick={onGenerate} disabled={loading}>{loading ? '생성 중...' : 'AI로 생성'}</button>
				</div>
			</div>
			{preview && (
				<div style={{ marginTop: 16 }}>
					<img src={preview.imageUrl} alt="삽화" style={{ width: '100%', maxWidth: 640, borderRadius: 8 }} />
                    <div style={{ marginTop: 8 }}>
                        <button onClick={onGenerateImage} disabled={imgLoading}>{imgLoading ? '삽화 생성 중...' : 'AI로 삽화 생성(Imagen)'}</button>
                    </div>
					<h3>{preview.title}</h3>
					<pre style={{ whiteSpace: 'pre-wrap' }}>{preview.body}</pre>
					<button onClick={onSaveAndStart}>저장하고 시작</button>
				</div>
			)}
		</div>
	);
}


