// ==========================================================
// APP.JS
// Arquivo principal da aplicação.
// Aqui controlamos:
// - autenticação
// - estado global
// - eventos
// - navegação
// - integração entre banco e interface
// ==========================================================

import {
  auth,
  googleProvider
} from "./firebase-config.js";

import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  salvarListaFirestore,
  buscarUltimaListaFirestore,
  salvarFeiraFirestore,
  buscarUltimasFeirasFirestore
} from "./db.js";

import {
  renderizarListaPreview,
  renderizarFeira,
  renderizarComprados,
  renderizarComparacao,
  formatarMoeda
} from "./ui.js";

// ==========================================================
// ESTADO GLOBAL DA APLICAÇÃO
// Tudo que a aplicação precisa saber durante o uso atual.
// ==========================================================
const state = {
  uid: null,
  usuario: null,

  // Lista que o usuário está montando na tela LISTA
  listaEmConstrucao: [],

  // Itens ativos da feira atual
  feiraAtual: [],

  // Itens comprados da feira atual
  itensComprados: [],

  // Resultado da comparação com última feira
  comparacao: [],
	orcamento: 0
};

// ==========================================================
// ELEMENTOS DO DOM
// Centralizamos aqui para facilitar manutenção.
// ==========================================================
const el = {
  userStatus: document.getElementById("user-status"),
  connectionStatus: document.getElementById("connection-status"),

  btnLoginGoogle: document.getElementById("btn-login-google"),
  btnLoginAnon: document.getElementById("btn-login-anon"),
  btnLogout: document.getElementById("btn-logout"),

  navButtons: document.querySelectorAll(".nav-btn"),
  screens: document.querySelectorAll(".screen"),

  itemNome: document.getElementById("item-nome"),
  itemQuantidade: document.getElementById("item-quantidade"),

  btnAdicionarItem: document.getElementById("btn-adicionar-item"),
  btnSalvarLista: document.getElementById("btn-salvar-lista"),
  btnRestaurarLista: document.getElementById("btn-restaurar-lista"),

  listaItensPreview: document.getElementById("lista-itens-preview"),
  feiraItens: document.getElementById("feira-itens"),
  compradosItens: document.getElementById("comprados-itens"),
  comparacaoItens: document.getElementById("comparacao-itens"),

  contadorItensLista: document.getElementById("contador-itens-lista"),
  contadorItensFeira: document.getElementById("contador-itens-feira"),
  contadorItensComprados: document.getElementById("contador-itens-comprados"),

  totalCompra: document.getElementById("total-compra"),

inputOrcamento: document.getElementById("input-orcamento"),
orcamentoTotal: document.getElementById("orcamento-total"),
orcamentoRestante: document.getElementById("orcamento-restante"),

  btnFinalizarFeira: document.getElementById("btn-finalizar-feira"),
  btnNovaFeira: document.getElementById("btn-nova-feira")
};

// ==========================================================
// UTILITÁRIOS
// ==========================================================
function gerarId() {
  return crypto.randomUUID();
}

function normalizarTexto(texto) {
  return String(texto || "").trim();
}

function calcularTotalCompra() {
  return state.itensComprados.reduce((acc, item) => {
    return acc + Number(item.quantidade) * Number(item.preco || 0);
  }, 0);
}

function atualizarOrcamentoVisual(){

const total = calcularTotalCompra()
const orcamento = Number(state.orcamento || 0)

const restante = orcamento - total

// valores
const elOrcamentoDefinido = document.getElementById("orcamento-definido")
const elPercentual = document.getElementById("orcamento-percentual")
const progressBar = document.getElementById("progress-bar-fill")

if(elOrcamentoDefinido)
elOrcamentoDefinido.textContent = formatarMoeda(orcamento)

el.orcamentoTotal.textContent = formatarMoeda(total)
el.orcamentoRestante.textContent = formatarMoeda(restante)


// ======================
// CALCULO DE PERCENTUAL
// ======================

let percentual = 0

if(orcamento > 0){
percentual = (total / orcamento) * 100
}

percentual = Math.min(percentual, 150)

if(elPercentual)
elPercentual.textContent = percentual.toFixed(0) + "%"


// ======================
// BARRA DE PROGRESSO
// ======================

if(progressBar){

progressBar.style.width = percentual + "%"

if(percentual < 80)
progressBar.style.background = "#2e7d32"

else if(percentual < 100)
progressBar.style.background = "#f9a825"

else
progressBar.style.background = "#c62828"

}


// ======================
// ALERTA VISUAL RESTANTE
// ======================

if(restante < 0){

el.orcamentoRestante.style.color = "red"

}else{

el.orcamentoRestante.style.color = ""

}

}

function limparSessaoFeira() {
  state.feiraAtual = [];
  state.itensComprados = [];
  state.comparacao = [];

  renderizarTudo();
}

// ==========================================================
// NAVEGAÇÃO ENTRE TELAS
// ==========================================================
function trocarTela(screenId) {
  el.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
  });

  el.navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.screen === screenId);
  });
}

// ==========================================================
// ATUALIZA CONTADORES E TOTAIS DA UI
// ==========================================================
function atualizarResumoVisual() {
  el.contadorItensLista.textContent = `${state.listaEmConstrucao.length} item(ns)`;

  const pendentes = state.feiraAtual.filter((item) => !item.comprado);
  el.contadorItensFeira.textContent = `${pendentes.length} pendente(s)`;

  el.contadorItensComprados.textContent = `${state.itensComprados.length} comprado(s)`;
  el.totalCompra.textContent = formatarMoeda(calcularTotalCompra());
}

// ==========================================================
// RENDER GERAL
// Centraliza todas as renderizações.
// ==========================================================
function renderizarTudo() {
  renderizarListaPreview(el.listaItensPreview, state.listaEmConstrucao);

  const pendentes = state.feiraAtual.filter((item) => !item.comprado);
  renderizarFeira(el.feiraItens, pendentes);

  renderizarComprados(el.compradosItens, state.itensComprados);

  renderizarComparacao(el.comparacaoItens, state.comparacao);

  atualizarResumoVisual();

atualizarOrcamentoVisual();		
}

// ==========================================================
// LIMPA CAMPOS DA TELA LISTA
// ==========================================================
function limparCamposLista() {
  el.itemNome.value = "";
  el.itemQuantidade.value = "1";
  el.itemNome.focus();
}

// ==========================================================
// ADICIONA ITEM À LISTA EM CONSTRUÇÃO
// ==========================================================
function adicionarItemNaLista() {
  const nome = normalizarTexto(el.itemNome.value);
  const quantidade = Number(el.itemQuantidade.value || 1);

  if (!nome) {
    alert("Digite o nome do item.");
    el.itemNome.focus();
    return;
  }

  if (quantidade <= 0) {
    alert("A quantidade deve ser maior que zero.");
    el.itemQuantidade.focus()
	el.itemQuantidade.select()
    return;
  }

  const novoItem = {
    id: gerarId(),
    nome,
    quantidade,
    preco: "",
    comprado: false,
    caro: false
  };

  state.listaEmConstrucao.push(novoItem);

  renderizarTudo();
  limparCamposLista();
}

// ==========================================================
// REMOVE ITEM DA PRÉVIA DA LISTA
// ==========================================================
function removerItemDaLista(id) {
  state.listaEmConstrucao = state.listaEmConstrucao.filter((item) => item.id !== id);
  renderizarTudo();
}

// ==========================================================
// SALVA LISTA NO FIREBASE E PREPARA A FEIRA ATUAL
// ==========================================================
async function salvarLista() {
  if (!state.uid) {
    alert("Você precisa estar autenticado para salvar a lista.");
    return;
  }

  if (!state.listaEmConstrucao.length) {
    alert("Adicione pelo menos um item antes de salvar.");
    return;
  }

  try {
    const copiaLista = structuredClone(state.listaEmConstrucao);

    await salvarListaFirestore(state.uid, copiaLista);

    // A feira atual passa a ser a lista salva
    state.feiraAtual = structuredClone(copiaLista);
    state.itensComprados = [];
    state.comparacao = [];

    // Limpa a tela de montagem da lista, conforme sua regra
    state.listaEmConstrucao = [];
    limparCamposLista();

    await prepararComparacao();

    renderizarTudo();
    trocarTela("feira-screen");

    alert("Lista salva com sucesso.");
  } catch (error) {
    console.error("Erro ao salvar lista:", error);
    alert("Não foi possível salvar a lista.");
  }
}

// ==========================================================
// RESTAURA A ÚLTIMA LISTA DO FIREBASE
// ==========================================================
async function restaurarUltimaLista() {
  if (!state.uid) {
    alert("Você precisa estar autenticado para restaurar a lista.");
    return;
  }

  try {
    const ultimaLista = await buscarUltimaListaFirestore(state.uid);

    if (!ultimaLista || !Array.isArray(ultimaLista.itens) || !ultimaLista.itens.length) {
      alert("Nenhuma lista anterior encontrada.");
      return;
    }

    // Restauramos para a tela de construção da lista
    state.listaEmConstrucao = ultimaLista.itens.map((item) => ({
      id: gerarId(),
      nome: item.nome,
      quantidade: Number(item.quantidade || 1),
      preco: "",
      comprado: false,
      caro: Boolean(item.caro),
    }));

    renderizarTudo();
    trocarTela("lista-screen");
    limparCamposLista();
  } catch (error) {
    console.error("Erro ao restaurar lista:", error);
    alert("Não foi possível restaurar a última lista.");
  }
}

async function iniciarNovaFeira() {

  if (!state.uid) {
    alert("Você precisa estar autenticado para iniciar uma nova feira.");
    return;
  }

  try {

    // limpa todo o estado da aplicação
    state.feiraAtual = [];
    state.itensComprados = [];
    state.comparacao = [];
    state.listaEmConstrucao = [];

    renderizarTudo();

    // volta para tela de criação da lista
    trocarTela("lista-screen");

    limparCamposLista();

  } catch (error) {
    console.error("Erro ao iniciar nova feira:", error);
    alert("Não foi possível iniciar uma nova feira.");
  }

}

// ==========================================================
// ATUALIZA PREÇO DE UM ITEM DA FEIRA
// ==========================================================
function atualizarPrecoItem(id, valor) {
  const item = state.feiraAtual.find((i) => i.id === id);
  if (!item) return;

  item.preco = valor;
}

// ==========================================================
// MARCA ITEM COMO COMPRADO
// Ao marcar comprado, o item sai da tela feira
// e entra em itens comprados.
// ==========================================================
function marcarComoComprado(id) {
  const item = state.feiraAtual.find((i) => i.id === id);
  if (!item) return;

  if (item.preco === "" || Number(item.preco) < 0) {
    alert("Digite um preço válido antes de marcar como comprado.");
    return;
  }

  item.comprado = true;

  const jaExiste = state.itensComprados.some((i) => i.id === id);
  if (!jaExiste) {
    state.itensComprados.push(item);
  }

  renderizarTudo();
}

// ==========================================================
// MARCA ITEM COMO CARO
// Não remove da lista.
// ==========================================================
function marcarComoCaro(id) {
  const item = state.feiraAtual.find((i) => i.id === id);
  if (!item) return;

  item.caro = !item.caro;
  renderizarTudo();
}

// ==========================================================
// EDITA ITEM DA FEIRA
// Aqui usamos prompt para manter simplicidade inicial.
// Em uma V2 isso pode virar modal.
// ==========================================================
function editarItemDaFeira(id) {
  const item = state.feiraAtual.find((i) => i.id === id);
  if (!item) return;

  const novoNome = prompt("Editar nome do item:", item.nome);
  if (novoNome === null) return;

  const novaQuantidade = prompt("Editar quantidade:", item.quantidade);
  if (novaQuantidade === null) return;

  const nomeTratado = normalizarTexto(novoNome);
  const quantidadeTratada = Number(novaQuantidade);

  if (!nomeTratado) {
    alert("Nome inválido.");
    return;
  }

  if (quantidadeTratada <= 0) {
    alert("Quantidade inválida.");
    return;
  }

  item.nome = nomeTratado;
  item.quantidade = quantidadeTratada;

  renderizarTudo();
}

// ==========================================================
// EXCLUI ITEM DA FEIRA
// Remove tanto da feira quanto da lista de comprados,
// caso ele já esteja comprado.
// ==========================================================
function excluirItemDaFeira(id) {
  state.feiraAtual = state.feiraAtual.filter((item) => item.id !== id);
  state.itensComprados = state.itensComprados.filter((item) => item.id !== id);
  renderizarTudo();
}

// ==========================================================
// SALVA A FEIRA ATUAL NO FIRESTORE
// ==========================================================
async function finalizarFeiraAtual() {
  if (!state.uid) {
    alert("Você precisa estar autenticado para salvar a feira.");
    return;
  }

  if (!state.itensComprados.length) {
    alert("Nenhum item comprado para salvar.");
    return;
  }

  try {
    await salvarFeiraFirestore(state.uid, structuredClone(state.feiraAtual));
    await prepararComparacao();

    renderizarTudo();
    trocarTela("comparacao-screen");

    alert("Feira salva com sucesso.");
  } catch (error) {
    console.error("Erro ao salvar feira:", error);
    alert("Não foi possível salvar a feira.");
  }
}

// ==========================================================
// MONTA DADOS DE COMPARAÇÃO
// Compara a feira atual com a última feira anterior.
// ==========================================================
async function prepararComparacao() {
  if (!state.uid) {
    state.comparacao = [];
    return;
  }

  try {
    const feiras = await buscarUltimasFeirasFirestore(state.uid, 2);

    // Precisamos de pelo menos 2 feiras para comparar:
    // feira atual salva agora + feira anterior
    if (!feiras || feiras.length < 2) {
      state.comparacao = [];
      return;
    }

    const feiraMaisRecente = feiras[0];
    const feiraAnterior = feiras[1];

    const mapaAnterior = new Map();

    (feiraAnterior.itens || []).forEach((item) => {
      if (item.comprado && item.preco !== "") {
        mapaAnterior.set(item.nome.trim().toLowerCase(), Number(item.preco));
      }
    });

    const comparacoes = [];

    (feiraMaisRecente.itens || []).forEach((itemAtual) => {
      const chave = itemAtual.nome.trim().toLowerCase();

      if (!itemAtual.comprado || itemAtual.preco === "") return;
      if (!mapaAnterior.has(chave)) return;

      const precoAnterior = mapaAnterior.get(chave);
      const precoAtual = Number(itemAtual.preco);
      const diferenca = precoAtual - precoAnterior;

      let percentual = 0;
      if (precoAnterior > 0) {
        percentual = (diferenca / precoAnterior) * 100;
      }

      comparacoes.push({
        nome: itemAtual.nome,
        precoAnterior,
        precoAtual,
        diferenca,
        percentual,
        percentualFormatado: `${percentual.toFixed(2).replace(".", ",")}%`
      });
    });

    state.comparacao = comparacoes;
  } catch (error) {
    console.error("Erro ao preparar comparação:", error);
    state.comparacao = [];
  }
}

// ==========================================================
// AUTENTICAÇÃO
// ==========================================================
async function entrarComGoogle() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Erro no login Google:", error);
    alert("Não foi possível entrar com Google.");
  }
}

async function entrarAnonimo() {
  try {
    await signInAnonymously(auth);
  } catch (error) {
    console.error("Erro no login anônimo:", error);
    alert("Não foi possível entrar de forma anônima.");
  }
}

async function sairDaConta() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao sair:", error);
    alert("Não foi possível sair.");
  }
}

// ==========================================================
// ATUALIZA STATUS VISUAL DO USUÁRIO
// ==========================================================
function atualizarStatusUsuario(user) {
  if (user) {
    state.uid = user.uid;
    state.usuario = user;

    const nome = user.displayName || "Usuário anônimo";
    el.userStatus.textContent = `Conectado: ${nome}`;

    el.btnLogout.classList.remove("hidden");
  } else {
    state.uid = null;
    state.usuario = null;

    el.userStatus.textContent = "Não autenticado";

    el.btnLogout.classList.add("hidden");
  }
}

// ==========================================================
// MONITORA CONECTIVIDADE
// ==========================================================
function atualizarStatusConexao() {
  el.connectionStatus.textContent = navigator.onLine ? "Modo online" : "Modo offline";
}

// ==========================================================
// EVENTOS GERAIS
// ==========================================================
function registrarEventos() {
  // Navegação inferior
  el.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      trocarTela(btn.dataset.screen);
    });
  });

  // Auth
  el.btnLoginGoogle.addEventListener("click", entrarComGoogle);
  el.btnLoginAnon.addEventListener("click", entrarAnonimo);
  el.btnLogout.addEventListener("click", sairDaConta);

  // Lista
  el.btnAdicionarItem.addEventListener("click", adicionarItemNaLista);
  el.btnSalvarLista.addEventListener("click", salvarLista);
  el.btnRestaurarLista.addEventListener("click", restaurarUltimaLista);

 // ==========================================================
// ENTER INTELIGENTE PARA MONTAGEM DA LISTA
// Fluxo:
// Nome -> ENTER -> Quantidade
// Quantidade -> ENTER -> Adicionar item
// Após adicionar -> campos limpos e cursor volta para Nome
// ==========================================================

// ENTER no campo nome move para quantidade
el.itemNome.addEventListener("keydown", (event) => {

  if (event.key === "Enter") {

    event.preventDefault()

    el.itemQuantidade.focus()
	el.itemQuantidade.select()

  }

})


// ENTER no campo quantidade adiciona item
el.itemQuantidade.addEventListener("keydown", (event) => {

  if (event.key === "Enter") {

    event.preventDefault()

    adicionarItemNaLista()

  }

})

  // Remoção de item da prévia da lista
  el.listaItensPreview.addEventListener("click", (event) => {
    const botao = event.target.closest("[data-acao='remover-preview']");
    if (!botao) return;

    removerItemDaLista(botao.dataset.id);
  });

  // Eventos da tela feira
  el.feiraItens.addEventListener("input", (event) => {
    const input = event.target.closest("[data-acao='input-preco']");
    if (!input) return;

    atualizarPrecoItem(input.dataset.id, input.value);
  });

  el.feiraItens.addEventListener("click", (event) => {
    const botao = event.target.closest("[data-acao]");
    if (!botao) return;

    const { acao, id } = botao.dataset;

    if (acao === "comprado") marcarComoComprado(id);
    if (acao === "caro") marcarComoCaro(id);
    if (acao === "editar") editarItemDaFeira(id);
    if (acao === "excluir-feira") excluirItemDaFeira(id);
  });

  // Finalizar feira
  el.btnFinalizarFeira.addEventListener("click", finalizarFeiraAtual);
  
  // Nova feira
	el.btnNovaFeira.addEventListener("click", iniciarNovaFeira);

	el.inputOrcamento.addEventListener("input", (event) => {

  state.orcamento = Number(event.target.value || 0);

  atualizarOrcamentoVisual();

});

  // Conectividade
  window.addEventListener("online", atualizarStatusConexao);
  window.addEventListener("offline", atualizarStatusConexao);
}

// ==========================================================
// INICIALIZAÇÃO DO APP
// ==========================================================
function init() {
  registrarEventos();
  atualizarStatusConexao();
  renderizarTudo();

  onAuthStateChanged(auth, async (user) => {
    atualizarStatusUsuario(user);
    renderizarTudo();
  });

// ==========================================================
// REGISTRO DO SERVICE WORKER + DETECÇÃO DE NOVA VERSÃO
// ==========================================================

if ("serviceWorker" in navigator) {

  window.addEventListener("load", async () => {

    try {

      const registration = await navigator.serviceWorker.register("./sw.js")

      console.log("Service Worker registrado com sucesso.")


      // Detecta nova versão instalada
      registration.addEventListener("updatefound", () => {

        const newWorker = registration.installing

        newWorker.addEventListener("statechange", () => {

          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {

            console.log("Nova versão do Feira Fácil disponível.")

            alert("Nova versão do Feira Fácil disponível. O app será atualizado.")

            window.location.reload()

          }

        })

      })


    } catch (error) {

      console.error("Erro ao registrar Service Worker:", error)

    }

  })

}
}

init();
