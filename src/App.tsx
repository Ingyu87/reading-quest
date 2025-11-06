import React from 'react';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './state/AppContext';
import { addQuestion, listQuestionsByArticle, likeQuestion, addAnswer, listAnswers } from './services/questions';
import { evaluateQuestion, downloadFeedback } from './services/evaluation';
import { getArticle } from './services/articles';
import type { ReadingStage } from './types';
import GenerateArticle from './components/GenerateArticle';

function Home() {
    const { nickname, setNickname, articleId, setArticleId } = useApp();
    const [showLogin, setShowLogin] = React.useState(!nickname);
    
    if (showLogin) {
        return (
            <div className="container mx-auto max-w-6xl p-6 flex items-center justify-center min-h-screen">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border-t-8 border-amber-300 w-full max-w-5xl text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight whitespace-nowrap">질문을 활용해 읽기과정 되돌아보기</h1>
                    <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed whitespace-nowrap">AI가 만들어주는 글을 읽으며 질문을 만들고, 친구들과 함께 생각을 나눠요!</p>
                    <div className="space-y-8 max-w-2xl mx-auto">
                        <div>
                            <label htmlFor="nickname-input" className="block text-left text-base font-semibold text-gray-700 mb-2">닉네임</label>
                            <input
                                type="text"
                                id="nickname-input"
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                placeholder="닉네임 (예: 행복한 토끼)"
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xl"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (nickname.trim()) setShowLogin(false);
                                else alert('닉네임을 입력해주세요!');
                            }}
                            className="w-full px-8 py-4 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all duration-300 text-xl"
                        >
                            활동 시작!
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl p-4">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-t-8 border-amber-300 my-12">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">어떤 글을 읽어볼까요?</h1>
                <div className="space-y-6">
                    <div className="text-sm text-gray-600">
                        안녕하세요, <strong className="text-amber-600">{nickname}</strong>님! 👋
                    </div>
                    <div>
                        <label htmlFor="article-code" className="block text-sm font-semibold text-gray-600 mb-1">활동 코드 (선택)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="article-code"
                                value={articleId}
                                onChange={e => setArticleId(e.target.value)}
                                placeholder="선생님이 알려준 코드 (비워두면 새 글)"
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
                            />
                            <button
                                onClick={() => setArticleId(Math.random().toString(36).slice(2, 8).toUpperCase())}
                                className="px-4 py-2 bg-amber-100 text-amber-700 font-semibold rounded-lg hover:bg-amber-200 transition-colors text-sm"
                            >
                                코드 만들기
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">같은 활동에 참여하려면 모두 같은 코드를 써요.</p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-lg font-medium text-gray-500">또는</span>
                        </div>
                    </div>
                    <Link
                        to="/start"
                        className="block w-full px-6 py-3 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all duration-300 text-lg text-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 11-8.486-4.95M19.071 16.071a5 5 0 01-4.95 8.486m-4.95-8.486l.99 1.714" />
                        </svg>
                        AI로 새 글 만들기
                    </Link>
                    <Link
                        to="/gallery"
                        className="block w-full px-6 py-3 bg-white text-amber-600 border-2 border-amber-500 font-bold rounded-lg shadow-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all duration-300 text-lg text-center"
                    >
                        다른 친구들 글 보러가기 💬
                    </Link>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg my-12">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📖 사용 방법</h3>
                <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                        <span className="inline-block bg-amber-100 text-amber-700 text-sm font-bold px-2 py-1 rounded mr-3">1</span>
                        <span>위에 내 이름을 쓰고, 활동 코드를 입력해요. (모를 땐 코드 만들기)</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block bg-amber-100 text-amber-700 text-sm font-bold px-2 py-1 rounded mr-3">2</span>
                        <span>AI 글 읽기 시작을 눌러 글과 삽화를 만들어요.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block bg-amber-100 text-amber-700 text-sm font-bold px-2 py-1 rounded mr-3">3</span>
                        <span>읽기 전→중→후 단계에서 떠오르는 질문을 적고 저장해요.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-block bg-amber-100 text-amber-700 text-sm font-bold px-2 py-1 rounded mr-3">4</span>
                        <span>질문 갤러리에서 친구들의 질문을 보고 답변도 남겨요.</span>
                    </li>
                </ol>
            </div>
        </div>
    );
}

function FlowLayout() {
	return (
		<div>
			<nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
				<div className="container mx-auto max-w-2xl px-4 py-3">
					<div className="flex gap-2 overflow-x-auto">
						<Link to="/" className="px-3 py-1 text-sm text-gray-600 hover:text-amber-600 whitespace-nowrap">홈</Link>
						<Link to="/flow/pre" className="px-3 py-1 text-sm text-gray-600 hover:text-amber-600 whitespace-nowrap">1️⃣ 읽기 전</Link>
						<Link to="/flow/during" className="px-3 py-1 text-sm text-gray-600 hover:text-amber-600 whitespace-nowrap">2️⃣ 읽기 중</Link>
						<Link to="/flow/post" className="px-3 py-1 text-sm text-gray-600 hover:text-amber-600 whitespace-nowrap">3️⃣ 읽기 후</Link>
						<Link to="/flow/gallery" className="px-3 py-1 text-sm text-gray-600 hover:text-amber-600 whitespace-nowrap">💬 갤러리</Link>
					</div>
				</div>
			</nav>
			<Outlet />
		</div>
	);
}

function QuestionForm({ stage }: { stage: ReadingStage }) {
    const { nickname, articleId } = useApp();
    const [text, setText] = React.useState('');
    const [saving, setSaving] = React.useState(false);
    const [evaluating, setEvaluating] = React.useState(false);
    const [feedback, setFeedback] = React.useState<string | null>(null);
    const [articleData, setArticleData] = React.useState<{ title?: string; body?: string } | null>(null);
    const canSave = nickname && articleId && text && !saving;
    
    React.useEffect(() => {
        if (articleId) {
            getArticle(articleId).then(article => {
                if (article) {
                    setArticleData({ title: article.title, body: article.body });
                }
            }).catch(() => {});
        }
    }, [articleId]);
    
    const stageLabels = {
        pre: { num: '1️⃣', title: '읽기 전', hint: '제목과 그림을 보고 무슨 내용일지 짐작해 보세요.' },
        during: { num: '2️⃣', title: '읽기 중', hint: '글의 중심 내용을 찾으며 읽어보세요.' },
        post: { num: '3️⃣', title: '읽기 후', hint: '글 전체의 내용을 정리해 보세요.' },
    };
    const label = stageLabels[stage];
    
    return (
        <div className="container mx-auto max-w-2xl p-4">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg my-12">
                <div className="flex justify-between items-center mb-4">
                    <span className="inline-block bg-amber-100 text-amber-700 text-base font-semibold px-4 py-1 rounded-full">
                        {label.num} {label.title}
                    </span>
                    <button className="px-4 py-2 bg-amber-100 text-amber-700 font-semibold rounded-lg hover:bg-amber-200 transition-colors text-sm">
                        질문 힌트 💡
                    </button>
                </div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                    {label.hint}
                </label>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="예) 이 글은 어떤 내용을 다루고 있을까?"
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base resize-none"
                />
                <div className="flex gap-3 mt-6">
                    <button
                        disabled={!canSave || evaluating}
                        onClick={async () => {
                            setSaving(true);
                            try {
                                await addQuestion({ articleId, nickname, stage, text });
                                setText('');
                                alert('✅ 질문이 저장되었어요!');
                            } catch (e: any) {
                                alert('저장에 실패했습니다: ' + (e?.message || '알 수 없는 오류'));
                            } finally {
                                setSaving(false);
                            }
                        }}
                        className="flex-1 px-6 py-3 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? '저장 중...' : '저장하기'}
                    </button>
                    <button
                        disabled={!text || evaluating}
                        onClick={async () => {
                            setEvaluating(true);
                            setFeedback(null);
                            try {
                                const result = await evaluateQuestion({
                                    question: text,
                                    stage,
                                    articleTitle: articleData?.title,
                                    articleBody: articleData?.body,
                                });
                                setFeedback(result.feedback);
                            } catch (e: any) {
                                alert('평가에 실패했습니다: ' + (e?.message || '알 수 없는 오류'));
                            } finally {
                                setEvaluating(false);
                            }
                        }}
                        className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {evaluating ? '평가 중...' : '🤖 AI 평가'}
                    </button>
                </div>
                {feedback && (
                    <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xl font-bold text-blue-800">📝 AI 평가 피드백</h4>
                            <button
                                onClick={() => downloadFeedback(feedback, nickname, text, stage)}
                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                                💾 다운로드
                            </button>
                        </div>
                        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {feedback}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Gallery() {
    const { articleId, nickname } = useApp();
    const [loading, setLoading] = React.useState(true);
    const [questions, setQuestions] = React.useState<any[]>([]);
    const [answersMap, setAnswersMap] = React.useState<Record<string, any[]>>({});

    async function refresh() {
        setLoading(true);
        const qs = await listQuestionsByArticle(articleId);
        setQuestions(qs);
        const map: Record<string, any[]> = {};
        for (const q of qs) {
            map[q.id] = await listAnswers(q.id);
        }
        setAnswersMap(map);
        setLoading(false);
    }

    React.useEffect(() => { refresh(); }, [articleId]);

    if (loading) {
        return (
            <div className="container mx-auto max-w-2xl p-4 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="spinner mx-auto"></div>
                    <p className="text-lg font-semibold text-amber-700 mt-4">질문을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl p-4">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg my-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">💬 질문 갤러리</h2>
                {questions.length === 0 ? (
                    <p className="text-center text-gray-500">아직 등록된 질문이 없어요. 첫 번째 질문을 남겨보세요!</p>
                ) : (
                    <div className="space-y-6">
                        {questions.map(q => (
                            <div key={q.id} className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-amber-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <p className="text-gray-500 text-xs font-semibold mb-1">
                                            {q.nickname} · {new Date(q.createdAt).toLocaleString('ko-KR')}
                                        </p>
                                        <p className="text-lg font-semibold text-gray-800">{q.text}</p>
                                        <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                            {q.stage === 'pre' ? '읽기 전' : q.stage === 'during' ? '읽기 중' : '읽기 후'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            await likeQuestion(q.id);
                                            await refresh();
                                        }}
                                        className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm font-semibold"
                                    >
                                        👍 {q.likes ?? 0}
                                    </button>
                                </div>
                                <div className="mt-4 pl-4 border-l-4 border-gray-100 space-y-3">
                                    {(answersMap[q.id] || []).length > 0 ? (
                                        (answersMap[q.id] || []).map(a => (
                                            <div key={a.id} className="bg-gray-50 p-3 rounded-lg">
                                                <p className="font-semibold text-sm text-amber-700">{a.nickname || '익명'}</p>
                                                <p className="text-gray-700 mt-1 text-base">{a.text}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm italic pl-2">아직 답변이 없습니다.</span>
                                    )}
                                </div>
                                <AnswerBox questionId={q.id} onSubmitted={refresh} nickname={nickname} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function AnswerBox({ questionId, onSubmitted, nickname }: { questionId: string; onSubmitted: () => void; nickname: string; }) {
    const [text, setText] = React.useState('');
    const can = text && nickname;
    return (
        <div className="mt-4">
            <label className="text-sm font-semibold text-gray-600 mb-1 block">이 질문에 대한 답변 달기...</label>
            <div className="flex items-center space-x-2">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-base resize-none"
                    rows={2}
                    placeholder="답변을 입력하세요..."
                />
                <button
                    disabled={!can}
                    onClick={async () => {
                        if (text.trim() && nickname) {
                            await addAnswer({ questionId, nickname, text });
                            setText('');
                            onSubmitted();
                        }
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    답변 등록
                </button>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AppProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/start" element={<GenerateArticle />} />
                <Route path="/flow" element={<FlowLayout />}>
                    <Route index element={<QuestionForm stage="pre" />} />
                    <Route path="pre" element={<QuestionForm stage="pre" />} />
                    <Route path="during" element={<QuestionForm stage="during" />} />
                    <Route path="adjust" element={<div style={{ padding: 24 }}><h2>3단계: 읽기 조정 점검</h2><p>다음 단계에서 구현 예정</p></div>} />
                    <Route path="post" element={<QuestionForm stage="post" />} />
                    <Route path="selfcheck" element={<div style={{ padding: 24 }}><h2>5단계: 질문 자가 점검</h2><p>다음 단계에서 구현 예정</p></div>} />
                    <Route path="gallery" element={<Gallery />} />
                </Route>
                <Route path="/gallery" element={<Gallery />} />
            </Routes>
        </AppProvider>
    );
}


