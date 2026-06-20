const listaProdutos = document.getElementById("listaProdutos");
const campoBusca = document.getElementById("buscarProduto");

// =========================
// CARREGAR PRODUTOS
// =========================

function obterProdutos() {
    return JSON.parse(localStorage.getItem("estoque")) || [];
}

// =========================
// RENDERIZAR TABELA
// =========================

function renderizarProdutos(lista) {

    listaProdutos.innerHTML = "";

    if (lista.length === 0) {
        listaProdutos.innerHTML = `
            <tr>
                <td colspan="7">Nenhum produto encontrado.</td>
            </tr>
        `;
        return;
    }

    lista.forEach((produto, index) => {

        let statusEstoque = "ok";

        if (produto.quantidade <= 10) {
            statusEstoque = "warning";
        }

        if (produto.quantidade <= 5) {
            statusEstoque = "danger";
        }

        listaProdutos.innerHTML += `
            <tr>

                <td>${index + 1}</td>

                <td>
                    ${
                        produto.imagem
                        ? `<img src="${produto.imagem}" class="product-image">`
                        : "Sem imagem"
                    }
                </td>

                <td>${produto.nome}</td>

                <td>${produto.codigoBarras || "-"}</td>

                <td>${produto.categoria}</td>

                <td>${formatarMoeda(produto.precoVenda)}</td>

                <td>
                    <span class="stock ${statusEstoque}">
                        ${produto.quantidade} ${produto.unidade}
                    </span>
                </td>

                <td>
                    <button class="edit" onclick="editarProduto(${produto.id})">
                        ✏️
                    </button>

                    <button class="delete" onclick="excluirProduto(${produto.id})">
                        🗑️
                    </button>
                </td>

            </tr>
        `;
    });
}

// =========================
// CARREGAR INICIAL
// =========================

function carregarProdutos() {
    renderizarProdutos(obterProdutos());
}

// =========================
// BUSCAR PRODUTOS
// =========================

function buscarProdutos() {

    const termo = campoBusca.value.toLowerCase();

    const produtos = obterProdutos();

    const filtrados = produtos.filter(produto => {

        const nome = (produto.nome || "").toLowerCase();
        const categoria = (produto.categoria || "").toLowerCase();
        const codigo = (produto.codigoBarras || "").toString();

        return (
            nome.includes(termo) ||
            categoria.includes(termo) ||
            codigo.includes(termo)
        );
    });

    renderizarProdutos(filtrados);
}

// =========================
// EXCLUIR PRODUTO
// =========================

function excluirProduto(id) {

    if (!confirm("Deseja realmente excluir este produto?")) {
        return;
    }

    let estoque = obterProdutos();

    estoque = estoque.filter(produto => produto.id !== id);

    localStorage.setItem("estoque", JSON.stringify(estoque));

    carregarProdutos();
}

// =========================
// EDITAR PRODUTO
// =========================

function editarProduto(id) {

    localStorage.setItem("produtoEditando", id);

    window.location.href =
        "novoProduto/novoProduto.html";
}

// =========================
// EVENTOS
// =========================

if (campoBusca) {
    campoBusca.addEventListener("input", buscarProdutos);
}

carregarProdutos();