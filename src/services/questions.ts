import {
	Timestamp,
	addDoc,
	collection,
	doc,
	getDocs,
	increment,
	limit,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
} from 'firebase/firestore';
import { db, hasFirebase } from '../lib/firebase';
import type { Answer, Question, ReadingStage } from '../types';

const QUESTIONS = 'questions';

export async function addQuestion(params: {
	articleId: string;
	nickname: string;
	stage: ReadingStage;
	text: string;
}): Promise<string> {
	if (!hasFirebase || !db) throw new Error('Firebase not configured');
	const ref = await addDoc(collection(db, QUESTIONS), {
		articleId: params.articleId,
		nickname: params.nickname,
		stage: params.stage,
		text: params.text,
		likes: 0,
		createdAt: serverTimestamp(),
	});
	return ref.id;
}

export async function listQuestionsByArticle(articleId: string): Promise<Question[]> {
	if (!hasFirebase || !db) return [];
	const q = query(
		collection(db, QUESTIONS),
		orderBy('createdAt', 'desc')
	);
	const snap = await getDocs(q);
	const results: Question[] = [];
	snap.forEach(docSnap => {
		const data = docSnap.data() as any;
		if (data.articleId !== articleId) return;
		results.push({
			id: docSnap.id,
			articleId: data.articleId,
			nickname: data.nickname,
			stage: data.stage,
			text: data.text,
			likes: data.likes ?? 0,
			createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now()) as number,
		});
	});
	return results;
}

export async function likeQuestion(questionId: string): Promise<void> {
	if (!hasFirebase || !db) throw new Error('Firebase not configured');
	const ref = doc(db, QUESTIONS, questionId);
	await updateDoc(ref, { likes: increment(1) });
}

export async function addAnswer(params: {
	questionId: string;
	nickname: string;
	text: string;
}): Promise<string> {
	if (!hasFirebase || !db) throw new Error('Firebase not configured');
	const ref = await addDoc(collection(db, QUESTIONS, params.questionId, 'answers'), {
		nickname: params.nickname,
		text: params.text,
		createdAt: serverTimestamp(),
	});
	return ref.id;
}

export async function listAnswers(questionId: string): Promise<Answer[]> {
	if (!hasFirebase || !db) return [];
	const q = query(
		collection(db, QUESTIONS, questionId, 'answers'),
		orderBy('createdAt', 'asc'),
		limit(50)
	);
	const snap = await getDocs(q);
	const results: Answer[] = [];
	snap.forEach(docSnap => {
		const data = docSnap.data() as any;
		results.push({
			id: docSnap.id,
			questionId,
			nickname: data.nickname,
			text: data.text,
			createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now()) as number,
		});
	});
	return results;
}


