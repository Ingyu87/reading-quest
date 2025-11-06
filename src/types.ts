export type ReadingStage = 'pre' | 'during' | 'post';

export interface Question {
	id: string;
	articleId: string;
	nickname: string;
	stage: ReadingStage;
	text: string;
	likes: number;
	createdAt: number; // epoch ms
}

export interface Answer {
	id: string;
	questionId: string;
	nickname: string;
	text: string;
	createdAt: number;
}



