import React from 'react';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './state/AppContext';
import { addQuestion, listQuestionsByArticle, likeQuestion, addAnswer, listAnswers } from './services/questions';
import type { ReadingStage } from './types';
import GenerateArticle from './components/GenerateArticle';

function Home() {
    const { nickname, setNickname, articleId, setArticleId, authReady } = useApp();
    return (
        <div style={{ padding: 24 }}>
            <h1>질문하는 독서 (Reading Quest)</h1>
            <p>AI가 만들어 주는 글로 읽기 연습을 하고, 내가 만든 질문을 남겨요.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <label>
                    내 이름(닉네임): <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="예) 별토끼" />
                </label>
                <label>
                    활동 코드: <input value={articleId} onChange={e => setArticleId(e.target.value)} placeholder="선생님이 알려준 코드" />
                </label>
                <button onClick={() => setArticleId(Math.random().toString(36).slice(2, 8))}>코드 만들기</button>
                <span style={{ fontSize: 12, color: '#666' }}>{authReady ? 'Auth ready' : '...'}</span>
                <div style={{ width: '100%', fontSize: 12, color: '#666' }}>
                    같은 활동에 참여하려면 모두 같은 코드를 써요. 새 글을 만들면 코드가 자동으로 생겨요.
                </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <Link to="/start">AI 글 읽기 시작</Link>
                <Link to="/gallery">질문 갤러리 보기</Link>
            </div>
            <div style={{ marginTop: 24 }}>
                <h3>사용 방법</h3>
                <ol>
                    <li>1) 위에 내 이름을 쓰고, 활동 코드를 입력해요. (모를 땐 코드 만들기)</li>
                    <li>2) AI 글 읽기 시작을 눌러 글과 삽화를 만들어요.</li>
                    <li>3) 읽기 전→중→후 단계에서 떠오르는 질문을 적고 저장해요.</li>
                    <li>4) 질문 갤러리에서 친구들의 질문을 보고 답변도 남겨요.</li>
                </ol>
            </div>
        </div>
    );
}

function FlowLayout() {
	return (
		<div style={{ padding: 24 }}>
			<nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
				<Link to="/">홈</Link>
				<Link to="/flow/pre">1단계: 읽기 전</Link>
				<Link to="/flow/during">2단계: 읽기 중</Link>
				<Link to="/flow/adjust">3단계: 조정 점검</Link>
				<Link to="/flow/post">4단계: 읽기 후</Link>
				<Link to="/flow/selfcheck">5단계: 자가 점검</Link>
				<Link to="/flow/gallery">6단계: 질문 갤러리</Link>
			</nav>
			<Outlet />
		</div>
	);
}

function QuestionForm({ stage }: { stage: ReadingStage }) {
    const { nickname, articleId } = useApp();
    const [text, setText] = React.useState('');
    const [saving, setSaving] = React.useState(false);
    const canSave = nickname && articleId && text && !saving;
    return (
        <div style={{ padding: 24 }}>
            <h2>{stage === 'pre' ? '1단계: 읽기 전' : stage === 'during' ? '2단계: 읽기 중' : '4단계: 읽기 후'}</h2>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="질문을 입력하세요" rows={4} style={{ width: '100%', maxWidth: 600 }} />
            <div style={{ marginTop: 12 }}>
                <button disabled={!canSave} onClick={async () => {
                    setSaving(true);
                    try {
                        await addQuestion({ articleId, nickname, stage, text });
                        setText('');
                        alert('저장되었습니다.');
                    } finally {
                        setSaving(false);
                    }
                }}>
                    저장
                </button>
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

    return (
        <div style={{ padding: 24 }}>
            <h2>질문 갤러리</h2>
            {loading ? <p>불러오는 중...</p> : (
                <div style={{ display: 'grid', gap: 16 }}>
                    {questions.map(q => (
                        <div key={q.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>[{q.stage}] {q.text}</strong>
                                <button onClick={async () => { await likeQuestion(q.id); await refresh(); }}>👍 {q.likes ?? 0}</button>
                            </div>
                            <small>by {q.nickname}</small>
                            <div style={{ marginTop: 8 }}>
                                <details>
                                    <summary>답변 달기 / 보기</summary>
                                    <AnswerBox questionId={q.id} onSubmitted={refresh} nickname={nickname} />
                                    <ul>
                                        {(answersMap[q.id] || []).map(a => (
                                            <li key={a.id}>
                                                {a.text} <small>- {a.nickname}</small>
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AnswerBox({ questionId, onSubmitted, nickname }: { questionId: string; onSubmitted: () => void; nickname: string; }) {
    const [text, setText] = React.useState('');
    const can = text && nickname;
    return (
        <div style={{ marginTop: 8 }}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="답변 입력" style={{ width: '100%', maxWidth: 600 }} />
            <div style={{ marginTop: 8 }}>
                <button disabled={!can} onClick={async () => { await addAnswer({ questionId, nickname, text }); setText(''); onSubmitted(); }}>답변 등록</button>
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


