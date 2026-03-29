// =========================================
// CHAVES DE SALVAMENTO
// Essas chaves identificam os dados no localStorage.
// =========================================
const STORAGE_LISTA = "lista_compras_pwa_v2";
const STORAGE_HISTORICO = "historico_precos_pwa_v2";

// =========================================
// LISTA INICIAL PADRÃO
// Cada item possui:
// id
// nome
// quantidadeNumero = quantidade numérica
// unidade = kg, pct, un, lata...
// preco = preço unitário
// comprado = status do checkbox
// =========================================
const listaBase = [
  { id: 1, nome: "Arroz", quantidadeNumero: 1, unidade: "kg", preco: 0, comprado: false },
  { id: 2, nome: "Café", quantidadeNumero: 1, unidade: "kg", preco: 0, comprado: false },
  { id: 3, nome: "Fubá", quantidadeNumero: 2, unidade: "pacotes", preco: 0, comprado: false },
  { id: 4, nome: "Macarrão", quantidadeNumero: 3, unidade: "pacotes", preco: 0, comprado: false },
  { id: 5, nome: "Manteiga", quantidadeNumero: 1, unidade: "250 g", preco: 0, comprado: false },
  { id: 6, nome: "Leite", quantidadeNumero: 3, unidade: "pacotes", preco: 0, comprado: false },
  { id: 7, nome: "Milho verde", quantidadeNumero: 1, unidade: "lata", preco: 0, comprado: false },
  { id: 8, nome: "Ervilha (misturada)", quantidadeNumero: 1, unidade: "pacote", preco: 0, comprado: false },
  { id: 9, nome: "Sal de pedra", quantidadeNumero: 1, unidade: "kg", preco: 0, comprado: false },
  { id: 10, nome: "Sazón vermelho", quantidadeNumero: 1, unidade: "pacote", preco: 0, comprado: false },
  { id: 11, nome: "Papel higiênico", quantidadeNumero: 1, unidade: "pacote c/ 8", preco: 0, comprado: false },
  { id: 12, nome: "Sabão líquido", quantidadeNumero: 1, unidade: "unidade", preco: 0, comprado: false },
  { id: 13, nome: "Água sanitária", quantidadeNumero: 2, unidade: "garrafas", preco: 0, comprado: false },
  { id: 14, nome: "Detergente de prato", quantidadeNumero: 2, unidade: "unidades", preco: 0, comprado: false }
];

// =========================================
// ELEMENTOS DA TELA
// =========================================
const listaEl = document.getElementById("lista-compras");
const historicoEl = document.getElementById("historico-precos");

const totalItensEl = document.getElementById("total-itens");
const itensCompradosEl = document.getElementById("itens-comprados");
const valorTotalEl = document.getElementById("valor-total");

const inputNome = document.getElementById("input-nome");
const inputQuantidade = document.getElementById("input-quantidade");
const inputUnidade = document.getElementById("input-unidade");
const inputPreco = document.getElementById("input-preco");

const btnAdicionar = document.getElementById("btn-adicionar");
const btnMarcarTodos = document.getElementById("btn-marcar-todos");
const btnDesmarcarTodos = document.getElementById("btn-desmarcar-todos");
const btnLimparLista = document.getElementById("btn-limpar-lista");
const btnLimparHistorico = document.getElementById("btn-limpar-historico");

// =========================================
// CARREGAR LISTA
// Busca no localStorage. Se não existir,
// carrega a lista base.
// =========================================
function carregarLista() {
  const dados = localStorage.getItem(STORAGE_LISTA);

  if (dados) {
    return JSON.parse(dados);
  }

  return listaBase;
}

// =========================================
// CARREGAR HISTÓRICO
// Guarda o último preço informado por item.
// =========================================
function carregarHistorico() {
  const dados = localStorage.getItem(STORAGE_HISTORICO);

  if (dados) {
    return JSON.parse(dados);
  }

  return {};
}

// =========================================
// SALVAR LISTA
// =========================================
function salvarLista() {
  localStorage.setItem(STORAGE_LISTA, JSON.stringify(lista));
}

// =========================================
// SALVAR HISTÓRICO
// =========================================
function salvarHistorico() {
  localStorage.setItem(STORAGE_HISTORICO, JSON.stringify(historicoPrecos));
}

// =========================================
// FORMATAR MOEDA
// Transforma número em formato brasileiro.
// =========================================
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// =========================================
// GERAR NOVO ID
// Procura o maior id atual e soma 1.
// =========================================
function gerarNovoId() {
  if (lista.length === 0) return 1;

  const maiorId = Math.max(...lista.map(item => item.id));
  return maiorId + 1;
}

// =========================================
// CALCULAR SUBTOTAL
// subtotal = quantidade * preço unitário
// =========================================
function calcularSubtotal(item) {
  const quantidade = Number(item.quantidadeNumero) || 0;
  const preco = Number(item.preco) || 0;
  return quantidade * preco;
}

// =========================================
// ATUALIZAR HISTÓRICO DE PREÇO
// Guarda o último preço digitado por nome.
// =========================================
function atualizarHistoricoPreco(item) {
  const nomeNormalizado = item.nome.trim().toLowerCase();

  historicoPrecos[nomeNormalizado] = {
    nomeOriginal: item.nome,
    ultimoPreco: Number(item.preco) || 0,
    ultimaQuantidade: Number(item.quantidadeNumero) || 0,
    unidade: item.unidade || "",
    dataAtualizacao: new Date().toLocaleString("pt-BR")
  };

  salvarHistorico();
}

// =========================================
// RENDERIZAR HISTÓRICO
// Mostra todos os preços já guardados.
// =========================================
function renderizarHistorico() {
  historicoEl.innerHTML = "";

  const entradas = Object.values(historicoPrecos);

  if (entradas.length === 0) {
    historicoEl.innerHTML = "<p>Nenhum histórico salvo ainda.</p>";
    return;
  }

  entradas
    .sort((a, b) => a.nomeOriginal.localeCompare(b.nomeOriginal))
    .forEach((item) => {
      const div = document.createElement("div");
      div.className = "historico-item";

      div.innerHTML = `
        <strong>${item.nomeOriginal}</strong>
        <div>Último preço: ${formatarMoeda(item.ultimoPreco)}</div>
        <div>Quantidade registrada: ${item.ultimaQuantidade} ${item.unidade}</div>
        <div>Atualizado em: ${item.dataAtualizacao}</div>
      `;

      historicoEl.appendChild(div);
    });
}

// =========================================
// RENDERIZAR LISTA
// Monta toda a lista visualmente.
// =========================================
function renderizarLista() {
  listaEl.innerHTML = "";

  if (lista.length === 0) {
    listaEl.innerHTML = "<p>Sua lista está vazia.</p>";
    atualizarResumo();
    return;
  }

  lista.forEach((item) => {
    const subtotal = calcularSubtotal(item);

    const li = document.createElement("li");
    li.className = `item ${item.comprado ? "comprado" : ""}`;

    li.innerHTML = `
      <div class="item-topo">
        <div class="item-esquerda">
          <input
            type="checkbox"
            class="checkbox-item"
            ${item.comprado ? "checked" : ""}
            onchange="alternarItem(${item.id})"
          />

          <div class="texto-item">
            <span class="nome-item">${item.nome}</span>
            <span class="qtd-item">${item.quantidadeNumero} ${item.unidade}</span>
          </div>
        </div>

        <div class="item-acoes">
          <button class="btn-excluir" onclick="removerItem(${item.id})">Excluir</button>
        </div>
      </div>

      <div class="item-detalhes">
        <input
          type="number"
          min="1"
          step="1"
          value="${item.quantidadeNumero}"
          onchange="atualizarQuantidade(${item.id}, this.value)"
          placeholder="Quantidade"
        />

        <input
          type="number"
          min="0"
          step="0.01"
          value="${item.preco}"
          onchange="atualizarPreco(${item.id}, this.value)"
          placeholder="Preço unitário"
        />

        <div class="subtotal-box">
          <span>Subtotal</span>
          <strong>${formatarMoeda(subtotal)}</strong>
        </div>
      </div>
    `;

    listaEl.appendChild(li);
  });

  atualizarResumo();
}

// =========================================
// ATUALIZAR RESUMO
// Mostra total de itens, comprados e valor geral.
// =========================================
function atualizarResumo() {
  const totalItens = lista.length;
  const comprados = lista.filter(item => item.comprado).length;
  const valorTotal = lista.reduce((total, item) => total + calcularSubtotal(item), 0);

  totalItensEl.textContent = totalItens;
  itensCompradosEl.textContent = comprados;
  valorTotalEl.textContent = formatarMoeda(valorTotal);
}

// =========================================
// ADICIONAR ITEM
// Cria um novo item a partir do formulário.
// =========================================
function adicionarItem() {
  const nome = inputNome.value.trim();
  const quantidadeNumero = Number(inputQuantidade.value);
  const unidade = inputUnidade.value.trim();
  const preco = Number(inputPreco.value);

  if (!nome) {
    alert("Digite o nome do item.");
    return;
  }

  if (!quantidadeNumero || quantidadeNumero <= 0) {
    alert("Digite uma quantidade válida.");
    return;
  }

  const novoItem = {
    id: gerarNovoId(),
    nome,
    quantidadeNumero,
    unidade: unidade || "unidade",
    preco: preco || 0,
    comprado: false
  };

  lista.push(novoItem);
  salvarLista();

  if (novoItem.preco > 0) {
    atualizarHistoricoPreco(novoItem);
  }

  renderizarLista();
  renderizarHistorico();
  limparFormulario();
}

// =========================================
// LIMPAR FORMULÁRIO
// =========================================
function limparFormulario() {
  inputNome.value = "";
  inputQuantidade.value = "";
  inputUnidade.value = "";
  inputPreco.value = "";
  inputNome.focus();
}

// =========================================
// REMOVER ITEM
// Exclui item da lista.
// =========================================
function removerItem(id) {
  const confirmar = confirm("Deseja remover este item da lista?");

  if (!confirmar) return;

  lista = lista.filter(item => item.id !== id);
  salvarLista();
  renderizarLista();
}

// =========================================
// ALTERNAR CHECK
// Marca ou desmarca como comprado.
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
// ATUALIZAR QUANTIDADE
// =========================================
function atualizarQuantidade(id, valor) {
  const quantidade = Number(valor);

  lista = lista.map((item) => {
    if (item.id === id) {
      const atualizado = {
        ...item,
        quantidadeNumero: quantidade > 0 ? quantidade : 1
      };

      atualizarHistoricoPreco(atualizado);
      return atualizado;
    }

    return item;
  });

  salvarLista();
  renderizarLista();
  renderizarHistorico();
}

// =========================================
// ATUALIZAR PREÇO
// =========================================
function atualizarPreco(id, valor) {
  const preco = Number(valor);

  lista = lista.map((item) => {
    if (item.id === id) {
      const atualizado = {
        ...item,
        preco: preco >= 0 ? preco : 0
      };

      atualizarHistoricoPreco(atualizado);
      return atualizado;
    }

    return item;
  });

  salvarLista();
  renderizarLista();
  renderizarHistorico();
}

// =========================================
// MARCAR TODOS
// =========================================
function marcarTodos() {
  lista = lista.map(item => ({
    ...item,
    comprado: true
  }));

  salvarLista();
  renderizarLista();
}

// =========================================
// DESMARCAR TODOS
// =========================================
function desmarcarTodos() {
  lista = lista.map(item => ({
    ...item,
    comprado: false
  }));

  salvarLista();
  renderizarLista();
}

// =========================================
// APAGAR LISTA INTEIRA
// =========================================
function limparLista() {
  const confirmar = confirm("Tem certeza que deseja apagar toda a lista atual?");

  if (!confirmar) return;

  lista = [];
  salvarLista();
  renderizarLista();
}

// =========================================
// EVENTOS DOS BOTÕES
// =========================================
btnAdicionar.addEventListener("click", adicionarItem);
btnMarcarTodos.addEventListener("click", marcarTodos);
btnDesmarcarTodos.addEventListener("click", desmarcarTodos);
btnLimparLista.addEventListener("click", limparLista);
btnLimparHistorico.addEventListener("click", limparHistorico);

// Permite adicionar apertando Enter no formulário
[inputNome, inputQuantidade, inputUnidade, inputPreco].forEach((campo) => {
  campo.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      adicionarItem();
    }
  });
});

// =========================================
// REGISTRO DO SERVICE WORKER
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
// LIMPAR HISTÓRICO DE PREÇOS
// Apaga todo o histórico salvo no localStorage.
// =========================================
function limparHistorico() {
  const confirmar = confirm("Tem certeza que deseja apagar todo o histórico de preços?");

  if (!confirmar) return;

  historicoPrecos = ();
  salvarHistorico();
  renderizarHistorico();

  alert("Histórico apagado com sucesso.");
}

// =========================================
// DISPONIBILIZAR FUNÇÕES GLOBAIS
// Necessário porque alguns eventos estão
// sendo montados dentro do HTML gerado.
// =========================================
window.alternarItem = alternarItem;
window.removerItem = removerItem;
window.atualizarQuantidade = atualizarQuantidade;
window.atualizarPreco = atualizarPreco;

// =========================================
// INICIALIZAÇÃO
// =========================================
let lista = carregarLista();
let historicoPrecos = carregarHistorico();

renderizarLista();
renderizarHistorico();
