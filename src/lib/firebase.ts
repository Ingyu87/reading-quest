import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const hasFirebase = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (hasFirebase) {
	const firebaseConfig = {
		apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
		authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
		projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
		storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
		messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
		appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
	};
	app = initializeApp(firebaseConfig);
	auth = getAuth(app);
	db = getFirestore(app);
}

export { app, auth, db, hasFirebase };

export async function ensureAnonymousAuth(): Promise<string> {
	if (!hasFirebase || !auth) return 'no-firebase';
	return new Promise((resolve, reject) => {
		onAuthStateChanged(
			auth!,
			async user => {
				if (user) {
					resolve(user.uid);
					return;
				}
				try {
					const cred = await signInAnonymously(auth!);
					resolve(cred.user.uid);
				} catch (e) {
					reject(e);
				}
			},
			reject
		);
	});
}



