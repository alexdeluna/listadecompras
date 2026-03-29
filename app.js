const STORAGE_LISTA = "feira_lista_v4";
const STORAGE_ULTIMA = "feira_ultima_v4";

let lista = JSON.parse(localStorage.getItem(STORAGE_LISTA)) || [];
let ultima = JSON.parse(localStorage.getItem(STORAGE_ULTIMA)) || [];

function salvarLista() {
  localStorage.setItem(STORAGE_LISTA, JSON.stringify(lista));
}

function formatar(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function mostrarTela(id, botaoClicado) {
  document.querySelectorAll(".tela").forEach((t) => t.classList.remove("ativa"));
  document.querySelectorAll(".aba").forEach((a) => a.classList.remove("ativa"));

  document.getElementById(id).classList.add("ativa");

  if (botaoClicado) {
    botaoClicado.classList.add("ativa");
  }

  renderizar();
}

function adicionarItem() {
  const nome = document.getElementById("nomeItem").value.trim();
  const qtd = Number(document.getElementById("qtdItem").value);

  if (!nome || !qtd || qtd <= 0) {
    alert("Preencha nome e quantidade corretamente.");
    return;
  }

  lista.push({
    id: Date.now() + Math.random(),
    nome,
    qtd,
    preco: 0,
    comprado: false
  });

  salvarLista();
  renderizar();
}

function salvarListaManual() {
  salvarLista();

  document.getElementById("nomeItem").value = "";
  document.getElementById("qtdItem").value = "";

  alert("Lista salva com sucesso.");
}

function apagarListaAtual() {
  const confirmar = confirm("Tem certeza que deseja apagar toda a lista atual?");

  if (!confirmar) return;

  lista = [];
  salvarLista();
  renderizar();
}

function removerItem(id) {
  const confirmar = confirm("Deseja remover este item da lista?");

  if (!confirmar) return;

  lista = lista.filter((i) => i.id !== id);
  salvarLista();
  renderizar();
}

function atualizarPreco(id, valor) {
  lista = lista.map((i) => {
    if (i.id === id) {
      i.preco = Number(valor) >= 0 ? Number(valor) : 0;
    }
    return i;
  });

  salvarLista();
  renderizar();
}

function marcarComprado(id) {
  lista = lista.map((i) => {
    if (i.id === id) {
      i.comprado = !i.comprado;
    }
    return i;
  });

  salvarLista();
  renderizar();
}

function voltarParaFeira(id) {
  lista = lista.map((i) => {
    if (i.id === id) {
      i.comprado = false;
    }
    return i;
  });

  salvarLista();
  renderizar();
}

function subtotal(item) {
  return Number(item.qtd || 0) * Number(item.preco || 0);
}

function salvarUltimaFeira() {
  if (lista.length === 0) {
    alert("Lista vazia.");
    return;
  }

  ultima = JSON.parse(JSON.stringify(lista));
  localStorage.setItem(STORAGE_ULTIMA, JSON.stringify(ultima));

  alert("Última feira salva com sucesso.");
}

function restaurarUltimaLista() {
  if (!ultima.length) {
    alert("Nenhuma feira salva anteriormente.");
    return;
  }

  const confirmar = confirm("Deseja restaurar a última lista salva?");

  if (!confirmar) return;

  lista = ultima.map((i) => ({
    ...i,
    id: Date.now() + Math.random(),
    preco: 0,
    comprado: false
  }));

  salvarLista();
  renderizar();
}

function renderLista() {
  const el = document.getElementById("listaCadastro");
  if (!el) return;

  el.innerHTML = "";

  if (lista.length === 0) {
    el.innerHTML = "<p>Nenhum item na lista.</p>";
    return;
  }

  lista.forEach((i) => {
    const li = document.createElement("li");
    li.className = "item";

    li.innerHTML = `
      <div class="item-topo">
        <div class="item-info">
          <span class="item-nome">${i.nome}</span>
          <span class="item-qtd">${i.qtd} unidades</span>
        </div>

        <div class="item-acoes">
          <button class="btn-excluir" onclick="removerItem(${JSON.stringify(i.id)})">Excluir</button>
        </div>
      </div>
    `;

    el.appendChild(li);
  });
}

function renderFeira() {
  const el = document.getElementById("listaFeira");
  if (!el) return;

  el.innerHTML = "";

  const pendentes = lista.filter((i) => !i.comprado);
  const comprados = lista.filter((i) => i.comprado);

  const totalPendentesEl = document.getElementById("totalPendentes");
  const totalCompradosResumoEl = document.getElementById("totalCompradosResumo");

  if (totalPendentesEl) totalPendentesEl.innerText = pendentes.length;
  if (totalCompradosResumoEl) totalCompradosResumoEl.innerText = comprados.length;

  if (pendentes.length === 0) {
    el.innerHTML = "<p>Não há itens pendentes. Tudo foi comprado.</p>";
    return;
  }

  pendentes.forEach((i) => {
    const sub = subtotal(i);

    const li = document.createElement("li");
    li.className = "item";

    li.innerHTML = `
      <div class="item-topo">
        <div class="item-info">
          <span class="item-nome">${i.nome}</span>
          <span class="item-qtd">${i.qtd} unidades</span>
        </div>
      </div>

      <div class="preco-area">
        <div class="check-area">
          <input type="checkbox" onchange="marcarComprado(${JSON.stringify(i.id)})" />
          <span>Comprado</span>
        </div>

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Preço unitário"
          value="${i.preco}"
          onchange="atualizarPreco(${JSON.stringify(i.id)}, this.value)"
        />

        <div class="subtotal">${formatar(sub)}</div>
      </div>
    `;

    el.appendChild(li);
  });
}

function renderComprados() {
  const el = document.getElementById("listaComprados");
  const totalEl = document.getElementById("totalComprados");

  if (!el || !totalEl) return;

  el.innerHTML = "";

  const comprados = lista.filter((i) => i.comprado);
  let total = 0;

  if (comprados.length === 0) {
    el.innerHTML = "<p>Nenhum item foi marcado como comprado ainda.</p>";
    totalEl.innerText = formatar(0);
    return;
  }

  comprados.forEach((i) => {
    const sub = subtotal(i);
    total += sub;

    const li = document.createElement("li");
    li.className = "item";

    li.innerHTML = `
      <div class="item-topo">
        <div class="item-info">
          <span class="item-nome">✔ ${i.nome}</span>
          <span class="item-qtd">${i.qtd} unidades</span>
        </div>

        <div class="item-acoes">
          <button class="btn-voltar" onclick="voltarParaFeira(${JSON.stringify(i.id)})">Voltar</button>
        </div>
      </div>

      <div class="preco-area">
        <div>Preço</div>
        <div>${formatar(i.preco)}</div>
        <div class="subtotal">${formatar(sub)}</div>
      </div>
    `;

    el.appendChild(li);
  });

  totalEl.innerText = formatar(total);
}

function renderComparacao() {
  const el = document.getElementById("comparacaoLista");
  if (!el) return;

  el.innerHTML = "";

  if (!ultima.length) {
    el.innerHTML = "<p>Sem feira anterior salva para comparação.</p>";
    return;
  }

  if (!lista.length) {
    el.innerHTML = "<p>A lista atual está vazia.</p>";
    return;
  }

  lista.forEach((i) => {
    const base = ultima.find(
      (x) => x.nome.trim().toLowerCase() === i.nome.trim().toLowerCase()
    );

    if (!base) {
      const div = document.createElement("div");
      div.className = "comparacaoItem";
      div.innerHTML = `
        <strong>${i.nome}</strong><br>
        Item novo na lista atual.
        <div class="igual">Sem base anterior</div>
      `;
      el.appendChild(div);
      return;
    }

    const dif = Number(i.preco || 0) - Number(base.preco || 0);
    const perc = Number(base.preco || 0) > 0
      ? (dif / Number(base.preco)) * 100
      : 0;

    let classe = "igual";
    let status = "➖ Igual";

    if (dif > 0) {
      classe = "maisCaro";
      status = "⬆ Mais caro";
    } else if (dif < 0) {
      classe = "maisBarato";
      status = "⬇ Mais barato";
    }

    const div = document.createElement("div");
    div.className = "comparacaoItem";

    div.innerHTML = `
      <strong>${i.nome}</strong><br>
      Antes: ${formatar(base.preco)}<br>
      Agora: ${formatar(i.preco)}<br>
      Diferença: ${formatar(dif)} (${perc.toFixed(1)}%)
      <div class="${classe}">${status}</div>
    `;

    el.appendChild(div);
  });
}

function renderizar() {
  renderLista();
  renderFeira();
  renderComprados();
  renderComparacao();
}

renderizar();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

window.mostrarTela = mostrarTela;
window.adicionarItem = adicionarItem;
window.salvarListaManual = salvarListaManual;
window.restaurarUltimaLista = restaurarUltimaLista;
window.apagarListaAtual = apagarListaAtual;
window.removerItem = removerItem;
window.atualizarPreco = atualizarPreco;
window.marcarComprado = marcarComprado;
window.voltarParaFeira = voltarParaFeira;
window.salvarUltimaFeira = salvarUltimaFeira;
