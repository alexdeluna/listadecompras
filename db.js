// ==========================================================
// CAMADA DE ACESSO AO FIRESTORE
// Toda operação com banco fica aqui.
// Assim o restante do sistema não precisa conhecer
// detalhes internos do Firestore.
// ==========================================================

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

// ==========================================================
// SALVAR LISTA
// Salva a lista-base criada pelo usuário.
// ==========================================================
export async function salvarListaFirestore(uid, itens) {
  const ref = collection(db, "users", uid, "listas");

  const payload = {
    dataCriacao: serverTimestamp(),
    itens
  };

  const docRef = await addDoc(ref, payload);
  return docRef.id;
}

// ==========================================================
// BUSCAR ÚLTIMA LISTA
// Busca a lista mais recente criada pelo usuário.
// ==========================================================
export async function buscarUltimaListaFirestore(uid) {
  const ref = collection(db, "users", uid, "listas");
  const q = query(ref, orderBy("dataCriacao", "desc"), limit(1));
  const snap = await getDocs(q);

  if (snap.empty) return null;

  const doc = snap.docs[0];
  return {
    id: doc.id,
    ...doc.data()
  };
}

// ==========================================================
// SALVAR FEIRA
// Salva uma execução da compra com os preços atuais.
// ==========================================================
export async function salvarFeiraFirestore(uid, itens) {
  const ref = collection(db, "users", uid, "feiras");

  const payload = {
    dataCriacao: serverTimestamp(),
    itens
  };

  const docRef = await addDoc(ref, payload);
  return docRef.id;
}

// ==========================================================
// BUSCAR ÚLTIMAS FEIRAS
// Retorna as feiras mais recentes para comparação.
// ==========================================================
export async function buscarUltimasFeirasFirestore(uid, quantidade = 2) {
  const ref = collection(db, "users", uid, "feiras");
  const q = query(ref, orderBy("dataCriacao", "desc"), limit(quantidade));
  const snap = await getDocs(q);

  const resultados = [];
  snap.forEach((doc) => {
    resultados.push({
      id: doc.id,
      ...doc.data()
    });
  });

  return resultados;
}