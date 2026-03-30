import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAhQXutOUdsYtZ8mzWpSToIHEASzES4w8U",
  authDomain: "feira-facil-566ff.firebaseapp.com",
  projectId: "feira-facil-566ff",
  storageBucket: "feira-facil-566ff.firebasestorage.app",
  messagingSenderId: "549829034737",
  appId: "1:549829034737:web:0a0e399a7c4b57bcc09f50"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Serviços que vamos usar
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };