import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, hasFirebase } from '../lib/firebase';

export interface ArticleDoc {
	id: string;
	kind: '설명' | '의견';
	difficulty: '상' | '중' | '하';
	topic?: string;
	title: string;
	body: string;
	imageUrl: string;
	createdAt: number;
}

export async function saveArticle(input: Omit<ArticleDoc, 'id' | 'createdAt'>): Promise<string> {
	if (!hasFirebase || !db) throw new Error('Firebase not configured');
	const ref = await addDoc(collection(db, 'articles'), {
		...input,
		createdAt: serverTimestamp(),
	});
	return ref.id;
}

export async function getArticle(id: string): Promise<ArticleDoc | null> {
	if (!hasFirebase || !db) return null;
	const snap = await getDoc(doc(db, 'articles', id));
	if (!snap.exists()) return null;
	const data = snap.data() as any;
	return {
		id: snap.id,
		kind: data.kind,
		difficulty: data.difficulty,
		topic: data.topic,
		title: data.title,
		body: data.body,
		imageUrl: data.imageUrl,
		createdAt: Date.now(),
	};
}



