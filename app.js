// =========================================
// LISTA BASE DO APLICATIVO
// Aqui estão os itens iniciais da lista.
// Cada item tem:
// id = identificador único
// nome = nome do produto
// quantidade = quantidade desejada
// comprado = status do check
// =========================================
const listaBase = [
  { id: 1, nome: "Arroz", quantidade: "1 kg", comprado: false },
  { id: 2, nome: "Café", quantidade: "1 kg", comprado: false },
  { id: 3, nome: "Fubá", quantidade: "2 pacotes", comprado: false },
  { id: 4, nome: "Macarrão", quantidade: "3 pacotes", comprado: false },
  { id: 5, nome: "Manteiga", quantidade: "250 g", comprado: false },
  { id: 6, nome: "Leite", quantidade: "3 pacotes", comprado: false },
  { id: 7, nome: "Milho verde", quantidade: "1 lata", comprado: false },
  { id: 8, nome: "Ervilha (misturada)", quantidade: "1 pacote", comprado: false },
  { id: 9, nome: "Sal de pedra", quantidade: "1 kg", comprado: false },
  { id: 10, nome: "Sazón vermelho", quantidade: "1 pacote", comprado: false },
  { id: 11, nome: "Papel higiênico", quantidade: "1 pacote c/ 8", comprado: false },
  { id: 12, nome: "Sabão líquido", quantidade: "1 unidade", comprado: false },
  { id: 13, nome: "Água sanitária", quantidade: "2 garrafas", comprado: false },
  { id: 14, nome: "Detergente de prato", quantidade: "2 unidades", comprado: false }
];

// =========================================
// CHAVE DO LOCALSTORAGE
// Essa chave é usada para guardar a lista
// no navegador do celular.
// =========================================
const STORAGE_KEY = "lista_compras_pwa_v1";

// =========================================
// ELEMENTOS DA TELA
// Aqui pegamos os elementos do HTML para
// manipular via JavaScript.
// =========================================
const listaEl = document.getElementById("lista-compras");
const totalItensEl = document.getElementById("total-itens");
const itensCompradosEl = document.getElementById("itens-comprados");
const itensFaltandoEl = document.getElementById("itens-faltando");
const btnMarcarTodos = document.getElementById("btn-marcar-todos");
const btnDesmarcarTodos = document.getElementById("btn-desmarcar-todos");

// =========================================
// CARREGAR LISTA
// Tenta buscar a lista salva no localStorage.
// Se não existir nada salvo, usa a lista base.
// =========================================
function carregarLista() {
  const listaSalva = localStorage.getItem(STORAGE_KEY);

  if (listaSalva) {
    return JSON.parse(listaSalva);
  }

  return listaBase;
}

// =========================================
// SALVAR LISTA
// Salva a lista atual no localStorage.
// =========================================
function salvarLista() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

// =========================================
// RENDERIZAR LISTA
// Essa função desenha todos os itens na tela.
// =========================================
function renderizarLista() {
  listaEl.innerHTML = "";

  lista.forEach((item) => {
    const li = document.createElement("li");
    li.className = `item ${item.comprado ? "comprado" : ""}`;

    li.innerHTML = `
      <label class="label-item">
        <input
          type="checkbox"
          class="checkbox-item"
          ${item.comprado ? "checked" : ""}
          onchange="alternarItem(${item.id})"
        />
        <span class="texto-item">
          <span class="nome-item">${item.nome}</span>
          <span class="qtd-item">${item.quantidade}</span>
        </span>
      </label>
    `;

    listaEl.appendChild(li);
  });

  atualizarResumo();
}

// =========================================
// ATUALIZAR RESUMO
// Atualiza os números exibidos no topo:
// total, comprados e faltando.
// =========================================
function atualizarResumo() {
  const total = lista.length;
  const comprados = lista.filter((item) => item.comprado).length;
  const faltando = total - comprados;

  totalItensEl.textContent = total;
  itensCompradosEl.textContent = comprados;
  itensFaltandoEl.textContent = faltando;
}

// =========================================
// ALTERNAR ITEM
// Marca ou desmarca um item da lista.
// =========================================
function alternarItem(id) {
  lista = lista.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        comprado: !item.comprado
      };
    }

    return item;
  });

  salvarLista();
  renderizarLista();
}

// =========================================
// MARCAR TODOS
// Marca todos os itens como comprados.
// =========================================
function marcarTodos() {
  lista = lista.map((item) => ({
    ...item,
    comprado: true
  }));

  salvarLista();
  renderizarLista();
}

// =========================================
// DESMARCAR TODOS
// Remove o check de todos os itens.
// =========================================
function desmarcarTodos() {
  lista = lista.map((item) => ({
    ...item,
    comprado: false
  }));

  salvarLista();
  renderizarLista();
}

// =========================================
// EVENTOS DOS BOTÕES
// =========================================
btnMarcarTodos.addEventListener("click", marcarTodos);
btnDesmarcarTodos.addEventListener("click", desmarcarTodos);

// =========================================
// REGISTRAR O SERVICE WORKER
// Isso permite que o app tenha comportamento
// de PWA e suporte cache offline.
// =========================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => {
        console.log("Service Worker registrado com sucesso.");
      })
      .catch((erro) => {
        console.log("Erro ao registrar Service Worker:", erro);
      });
  });
}

// =========================================
// DISPONIBILIZAR FUNÇÃO NO WINDOW
// Como o onchange foi montado dentro do HTML
// gerado por JavaScript, precisamos deixar
// essa função acessível globalmente.
// =========================================
window.alternarItem = alternarItem;

// =========================================
// INICIALIZAÇÃO DO APP
// =========================================
let lista = carregarLista();
renderizarLista();
