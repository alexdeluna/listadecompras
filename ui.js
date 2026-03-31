// ==========================================================
// UI.JS
// Este arquivo contém as funções de renderização.
// Ele recebe dados prontos e devolve HTML para a tela.
// ==========================================================

// Formata números como moeda brasileira
export function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Gera um id simples para inputs ou elementos
export function gerarIdVisual(prefixo, id) {
  return `${prefixo}-${id}`;
}

// ==========================================================
// RENDERIZA PRÉVIA DA LISTA EM CONSTRUÇÃO
// ==========================================================
export function renderizarListaPreview(container, itens) {
  if (!itens.length) {
    container.className = "items-list empty-state";
    container.innerHTML = "Nenhum item adicionado ainda.";
    return;
  }

  container.className = "items-list";

  container.innerHTML = itens
    .map(
      (item) => `
      <div class="item-card">
        <div class="item-top">
          <div>
            <h3 class="item-title">${item.nome}</h3>
            <div class="item-subtitle">Quantidade: ${item.quantidade}</div>
          </div>
          <button class="btn danger" data-acao="remover-preview" data-id="${item.id}">
            Excluir
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

// ==========================================================
// RENDERIZA ITENS PENDENTES DA FEIRA
// ==========================================================
export function renderizarFeira(container, itensPendentes) {
  if (!itensPendentes.length) {
    container.className = "items-list empty-state";
    container.innerHTML = "Nenhum item pendente.";
    return;
  }

  container.className = "items-list";

  container.innerHTML = itensPendentes
    .map((item) => {
      const inputId = gerarIdVisual("preco", item.id);

      return `
        <div class="item-card">
          <div class="item-top">
            <div>
              <h3 class="item-title">${item.nome}</h3>
              <div class="item-subtitle">Quantidade: ${item.quantidade}</div>
            </div>

            <div class="item-flags">
              ${item.caro ? `<span class="flag caro">Caro</span>` : ""}
            </div>
          </div>

          <div class="item-body">
            <label for="${inputId}">Preço unitário</label>
            <input
              id="${inputId}"
              class="price-input"
              type="text"
              inputmode="decimal"
              min="0"
              step="0.01"
              placeholder="0,00"
              value="${item.preco || ""}"
              data-acao="input-preco"
              data-id="${item.id}"
            />

            <div class="item-actions">
              <button class="btn success" data-acao="comprado" data-id="${item.id}">
                Comprado
              </button>

              <button class="btn warning" data-acao="caro" data-id="${item.id}">
                Caro
              </button>

              <button class="btn secondary" data-acao="editar" data-id="${item.id}">
                Editar
              </button>

              <button class="btn danger" data-acao="excluir-feira" data-id="${item.id}">
                Excluir
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// ==========================================================
// RENDERIZA ITENS COMPRADOS
// ==========================================================
export function renderizarComprados(container, itensComprados) {
  if (!itensComprados.length) {
    container.className = "items-list empty-state";
    container.innerHTML = "Nenhum item comprado ainda.";
    return;
  }

  container.className = "items-list";

  container.innerHTML = itensComprados
    .map((item) => {
      const subtotal = Number(item.quantidade) * Number(item.preco || 0);

      return `
        <div class="item-card">
          <div class="item-top">
            <div>
              <h3 class="item-title">${item.nome}</h3>
              <div class="item-subtitle">Quantidade: ${item.quantidade}</div>
            </div>

            <div class="item-flags">
              <span class="flag comprado">Comprado</span>
              ${item.caro ? `<span class="flag caro">Caro</span>` : ""}
            </div>
          </div>

          <div class="item-meta">
            <div>Preço: ${formatarMoeda(item.preco)}</div>
            <div>Subtotal: ${formatarMoeda(subtotal)}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

// ==========================================================
// RENDERIZA COMPARAÇÃO
// ==========================================================
export function renderizarComparacao(container, comparacoes) {
  if (!comparacoes.length) {
    container.className = "items-list empty-state";
    container.innerHTML = "Ainda não há dados suficientes para comparar.";
    return;
  }

  container.className = "items-list";

  container.innerHTML = comparacoes
    .map((item) => {
      let statusClasse = "compare-equal";
      let statusTexto = "➖ Igual";

      if (item.diferenca > 0) {
        statusClasse = "compare-up";
        statusTexto = "⬆ Mais caro";
      } else if (item.diferenca < 0) {
        statusClasse = "compare-down";
        statusTexto = "⬇ Mais barato";
      }

      return `
        <div class="item-card">
          <div class="item-top">
            <div>
              <h3 class="item-title">${item.nome}</h3>
              <div class="item-subtitle ${statusClasse}">${statusTexto}</div>
            </div>
          </div>

          <div class="item-meta">
            <div>Preço anterior: ${formatarMoeda(item.precoAnterior)}</div>
            <div>Preço atual: ${formatarMoeda(item.precoAtual)}</div>
            <div>Diferença: ${formatarMoeda(item.diferenca)}</div>
            <div>Diferença percentual: ${item.percentualFormatado}</div>
          </div>
        </div>
      `;
    })
    .join("");
}
