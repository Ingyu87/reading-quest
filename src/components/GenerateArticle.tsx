import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateArticle, generateImage } from '../services/ai';
import { saveArticle } from '../services/articles';
import { useApp } from '../state/AppContext';

export default function GenerateArticle() {
	const nav = useNavigate();
	const { setArticleId, nickname } = useApp();
	const [kind, setKind] = React.useState<'설명' | '의견'>('설명');
	const [difficulty, setDifficulty] = React.useState<'상' | '중' | '하'>('중');
	const [topic, setTopic] = React.useState('');
	const [preview, setPreview] = React.useState<{ title: string; body: string; imageUrl: string } | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [imgLoading, setImgLoading] = React.useState(false);

	async function onGenerate() {
		if (!nickname) {
			alert('먼저 홈에서 닉네임을 입력해주세요!');
			nav('/');
			return;
		}
		setLoading(true);
		try {
			const g = await generateArticle({ kind, difficulty, topic });
			setPreview({ title: g.title, body: g.body, imageUrl: g.imageUrl });
		} catch (e: any) {
			alert('글 생성에 실패했습니다: ' + (e?.message || '알 수 없는 오류'));
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
		} catch (e: any) {
			alert('이미지 생성에 실패했습니다: ' + (e?.message || '알 수 없는 오류'));
		} finally {
			setImgLoading(false);
		}
	}

	async function onSaveAndStart() {
		if (!preview) return;
		try {
			const id = await saveArticle({ kind, difficulty, topic, title: preview.title, body: preview.body, imageUrl: preview.imageUrl });
			setArticleId(id);
			nav('/flow/pre');
		} catch (e: any) {
			alert('저장에 실패했습니다: ' + (e?.message || '알 수 없는 오류'));
		}
	}

	return (
		<div className="container mx-auto max-w-2xl p-4">
			<div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-t-8 border-amber-300 my-12">
				<h1 className="text-2xl font-bold text-gray-800 mb-6">어떤 글을 읽어볼까요?</h1>
				<div className="space-y-6">
					<div>
						<label htmlFor="article-type" className="block text-lg font-semibold text-gray-800 mb-2">1. 글의 종류</label>
						<select
							id="article-type"
							value={kind}
							onChange={e => setKind(e.target.value as any)}
							className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
						>
							<option value="설명">설명하는 글 (사실/정보 📝)</option>
							<option value="의견">의견을 제시하는 글 (주장/이유 🤔)</option>
						</select>
					</div>
					<div>
						<label htmlFor="article-difficulty" className="block text-lg font-semibold text-gray-800 mb-2">2. 난이도</label>
						<select
							id="article-difficulty"
							value={difficulty}
							onChange={e => setDifficulty(e.target.value as any)}
							className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
						>
							<option value="하">하 (쉬워요 🐣)</option>
							<option value="중">중 (적당해요 👍)</option>
							<option value="상">상 (어려워요 🧠)</option>
						</select>
					</div>
					<div>
						<label htmlFor="article-topic" className="block text-lg font-semibold text-gray-800 mb-2">3. 주제 (선택)</label>
						<input
							type="text"
							id="article-topic"
							value={topic}
							onChange={e => setTopic(e.target.value)}
							placeholder="예) 우주, 바다, AI (비워두면 AI가 추천)"
							className="w-full px-1 py-2 bg-transparent border-0 border-b-2 border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-amber-500 text-lg"
						/>
					</div>
					<button
						onClick={onGenerate}
						disabled={loading}
						className="w-full px-6 py-3 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? (
							<span className="flex items-center justify-center">
								<span className="spinner mr-2"></span>
								AI가 글을 만들고 있어요...
							</span>
						) : (
							<span className="flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 11-8.486-4.95M19.071 16.071a5 5 0 01-4.95 8.486m-4.95-8.486l.99 1.714" />
								</svg>
								AI로 새 글 만들기
							</span>
						)}
					</button>
				</div>
			</div>

			{preview && (
				<div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg my-12 animate-fade-in">
					<img src={preview.imageUrl} alt="삽화" className="w-full rounded-2xl shadow-lg mb-6" />
					<div className="mb-4">
						<button
							onClick={onGenerateImage}
							disabled={imgLoading}
							className="px-4 py-2 bg-amber-100 text-amber-700 font-semibold rounded-lg hover:bg-amber-200 transition-colors text-sm disabled:opacity-50"
						>
							{imgLoading ? '삽화 생성 중...' : '🖼️ AI로 삽화 다시 만들기'}
						</button>
					</div>
					<h3 className="text-2xl font-bold text-gray-800 mb-4">{preview.title}</h3>
					<div className="prose max-w-none bg-gray-50 p-5 rounded-xl mb-6 text-lg leading-relaxed whitespace-pre-wrap">
						{preview.body}
					</div>
					<button
						onClick={onSaveAndStart}
						className="w-full px-6 py-3 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all duration-300 text-lg"
					>
						✅ 저장하고 읽기 시작하기
					</button>
				</div>
			)}
		</div>
	);
}
