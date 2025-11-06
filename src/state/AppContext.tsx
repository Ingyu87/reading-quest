import React, { createContext, useContext, useMemo, useState } from 'react';
import { ensureAnonymousAuth } from '../lib/firebase';

interface AppState {
	nickname: string;
	setNickname: (v: string) => void;
	articleId: string;
	setArticleId: (v: string) => void;
	authReady: boolean;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [nickname, setNickname] = useState('');
	const [articleId, setArticleId] = useState('demo-article');
	const [authReady, setAuthReady] = useState(false);

	React.useEffect(() => {
		ensureAnonymousAuth().then(() => setAuthReady(true)).catch(() => setAuthReady(true));
	}, []);

	const value = useMemo(() => ({ nickname, setNickname, articleId, setArticleId, authReady }), [nickname, articleId, authReady]);
	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
	const v = useContext(Ctx);
	if (!v) throw new Error('AppContext missing');
	return v;
}


