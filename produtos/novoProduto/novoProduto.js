// =========================
// ELEMENTOS
// =========================

const precoCusto = document.getElementById("precoCusto");
const margemLucro = document.getElementById("margemLucro");
const precoVenda = document.getElementById("precoVenda");

const imagemProduto = document.getElementById("imagemProduto");
const previewImagem = document.getElementById("previewImagem");

const btnSalvar = document.querySelector(".green-btn");
const formProduto = document.getElementById("formProduto");

// =========================
// VARIÁVEIS
// =========================

let imagemBase64 = "";
let categorias = [];

// =========================
// CALCULAR PREÇO
// =========================

function calcularPrecoVenda() {

    const custo = parseFloat(precoCusto.value) || 0;
    const margem = parseFloat(margemLucro.value) || 0;

    precoVenda.value =
        (custo + (custo * margem / 100)).toFixed(2);
}

precoCusto.addEventListener("input", calcularPrecoVenda);
margemLucro.addEventListener("input", calcularPrecoVenda);

// =========================
// IMAGEM
// =========================

imagemProduto.addEventListener("change", (e) => {

    const arquivo = e.target.files[0];

    if (!arquivo) return;

    const reader = new FileReader();

    reader.onload = (ev) => {

        imagemBase64 = ev.target.result;

        previewImagem.src = imagemBase64;
        previewImagem.style.display = "block";
    };

    reader.readAsDataURL(arquivo);

});

// =========================
// CÓDIGO DE BARRAS
// =========================

function gerarCodigoBarras() {

    return Math.floor(
        1000000000000 + Math.random() * 9000000000000
    ).toString();

}

// =========================
// SALVAR PRODUTO
// =========================

btnSalvar.addEventListener("click", salvarProduto);

function salvarProduto() {

    const nome =
        document.getElementById("nomeProduto")
        .value
        .trim();

    let codigoBarras =
        document.getElementById("codigoBarras")
        .value
        .trim();

    if (!codigoBarras)
        codigoBarras = gerarCodigoBarras();

    if (!nome) {

        alert("Digite o nome do produto.");
        return;

    }

    const produto = {

        id: Date.now(),

        nome,

        codigoBarras,

        categoria:
            document.getElementById("categoria").value,

        precoCusto:
            parseFloat(
                document.getElementById("precoCusto").value
            ) || 0,

        precoVenda:
            parseFloat(
                document.getElementById("precoVenda").value
            ) || 0,

        margemLucro:
            parseFloat(
                document.getElementById("margemLucro").value
            ) || 0,

        quantidade:
            parseFloat(
                document.getElementById("quantidade").value
            ) || 0,

        unidade:
            document.getElementById("unidadesDeMedida").value,

        perecivel:
            document.getElementById("perecivel").checked,

        dataValidade:
            document.getElementById("dataValidade").value,

        imagem: imagemBase64,

        dataCadastro:
            new Date().toLocaleString("pt-BR")

    };

    let estoque =
        JSON.parse(localStorage.getItem("estoque"))
        || [];

    const idEditando =
        localStorage.getItem("produtoEditando");

    if (idEditando) {

        const index =
            estoque.findIndex(
                p => p.id == idEditando
            );

        produto.id = Number(idEditando);

        estoque[index] = produto;

        localStorage.removeItem(
            "produtoEditando"
        );

        alert("Produto atualizado!");

    } else {

        estoque.push(produto);

        alert("Produto cadastrado!");

    }

    localStorage.setItem(
        "estoque",
        JSON.stringify(estoque)
    );

    limparFormulario();

    window.location.href =
        "../produtos.html";
}

// =========================
// EDITAR PRODUTO
// =========================

const idProdutoEditando =
    localStorage.getItem("produtoEditando");

if (idProdutoEditando) {

    const estoque =
        JSON.parse(
            localStorage.getItem("estoque")
        ) || [];

    const produto =
        estoque.find(
            p => p.id == idProdutoEditando
        );

    if (produto) {

        document.getElementById(
            "nomeProduto"
        ).value = produto.nome;

        document.getElementById(
            "codigoBarras"
        ).value = produto.codigoBarras;

        document.getElementById(
            "categoria"
        ).value = produto.categoria;

        document.getElementById(
            "precoCusto"
        ).value = produto.precoCusto;

        document.getElementById(
            "margemLucro"
        ).value = produto.margemLucro;

        calcularPrecoVenda();

        document.getElementById(
            "quantidade"
        ).value = produto.quantidade;

        document.getElementById(
            "unidadesDeMedida"
        ).value = produto.unidade;

        document.getElementById(
            "dataValidade"
        ).value =
            produto.dataValidade || "";

        document.getElementById(
            "perecivel"
        ).checked =
            produto.perecivel;

        if (produto.imagem) {

            imagemBase64 =
                produto.imagem;

            previewImagem.src =
                produto.imagem;

            previewImagem.style.display =
                "block";

        }

    }

}

// =========================
// CATEGORIAS
// =========================

const btnSalvarCategoria =
    document.getElementById(
        "btnSalvarCategoria"
    );

const btnNovaCategoria =
    document.getElementById(
        "btnNovaCategoria"
    );

const selectCategoria =
    document.getElementById(
        "categoria"
    );

const btnExcluirCategoriaSelecionada =
    document.getElementById(
        "btnExcluirCategoriaSelecionada"
    );

// salvar storage

function salvarCategoriasStorage() {

    localStorage.setItem(
        "categorias",
        JSON.stringify(categorias)
    );

}

// carregar

function carregarCategoriasStorage() {

    categorias =
        JSON.parse(
            localStorage.getItem(
                "categorias"
            )
        ) || [];

    atualizarSelect();

}

// atualizar select

function atualizarSelect() {

    selectCategoria.innerHTML =
        `<option value="">Selecione</option>`;

    categorias.forEach(cat => {

        selectCategoria.innerHTML += `
            <option value="${cat}">
                ${cat}
            </option>
        `;

    });

}

// abrir formulário

btnNovaCategoria.addEventListener("click", () => {

    const form =
        document.getElementById("formNovaCategoria");

    const aberto =
        form.style.display === "flex";

    form.style.display =
        aberto ? "none" : "flex";

});

// salvar categoria

if (btnSalvarCategoria) {

    btnSalvarCategoria.addEventListener(
        "click",
        () => {

            const input =
                document.getElementById(
                    "novaCategoria"
                );

            const valor =
                input.value.trim();

            if (!valor) return;

            const existe =
                categorias.some(
                    c =>
                        c.toLowerCase() ===
                        valor.toLowerCase()
                );

            if (existe) {

                alert(
                    "Categoria já existe!"
                );

                return;

            }

            categorias.push(valor);

            salvarCategoriasStorage();

            atualizarSelect();

            selectCategoria.value =
                valor;

            input.value = "";

            if (
                btnExcluirCategoriaSelecionada
            ) {
                btnExcluirCategoriaSelecionada
                    .style.display =
                    "block";
            }

        }
    );

}

// mostrar botão excluir

if (
    selectCategoria &&
    btnExcluirCategoriaSelecionada
) {

    selectCategoria.addEventListener(
        "change",
        () => {

            btnExcluirCategoriaSelecionada
                .style.display =
                selectCategoria.value
                    ? "block"
                    : "none";

        }
    );

}

// excluir categoria

if (
    btnExcluirCategoriaSelecionada
) {

    btnExcluirCategoriaSelecionada
        .addEventListener(
            "click",
            () => {

                const categoria =
                    selectCategoria.value;

                if (!categoria)
                    return;

                const estoque =
                    JSON.parse(
                        localStorage.getItem(
                            "estoque"
                        )
                    ) || [];

                const usando =
                    estoque.some(
                        p =>
                            p.categoria ===
                            categoria
                    );

                if (usando) {

                    alert(
                        "Esta categoria possui produtos cadastrados."
                    );

                    return;

                }

                if (
                    !confirm(
                        `Deseja excluir a categoria "${categoria}"?`
                    )
                ) {
                    return;
                }

                categorias =
                    categorias.filter(
                        c =>
                            c !==
                            categoria
                    );

                salvarCategoriasStorage();

                atualizarSelect();

                selectCategoria.value =
                    "";

                btnExcluirCategoriaSelecionada
                    .style.display =
                    "none";

                alert(
                    "Categoria excluída com sucesso!"
                );

            }
        );

}

// =========================
// LIMPAR FORM
// =========================

function limparFormulario() {

    if (formProduto)
        formProduto.reset();

    previewImagem.src = "";
    previewImagem.style.display =
        "none";

    imagemBase64 = "";

    precoVenda.value = "";

}

// =========================
// INICIALIZAÇÃO
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarCategoriasStorage();

        if (
            btnExcluirCategoriaSelecionada
        ) {
            btnExcluirCategoriaSelecionada
                .style.display =
                "none";
        }

    }
);