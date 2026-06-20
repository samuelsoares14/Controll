// ======================
// ELEMENTOS
// ======================

const ingredientes = document.getElementById("ingredientes");
const btnAddIngrediente = document.getElementById("btnAddIngrediente");

const custoReceita = document.getElementById("custoReceita");
const margemLucro = document.getElementById("margemLucro");
const precoVenda = document.getElementById("precoVenda");

const fotoReceita = document.getElementById("fotoReceita");
const previewImagem = document.getElementById("previewImagem");

// ======================
// ESTOQUE
// ======================

function obterProdutos() {
    return JSON.parse(localStorage.getItem("estoque")) || [];
}

function obterReceitas() {
    return JSON.parse(localStorage.getItem("receitas")) || [];
}

let receitaEditandoId = null;

function renderizarIngredientes(lista = []) {
    ingredientes.innerHTML = "";

    if (!Array.isArray(lista) || lista.length === 0) {
        adicionarIngrediente();
        return;
    }

    lista.forEach(item => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td><input type="text" class="ingrediente" list="listaProdutos" value="${item.nome || ""}"></td>
            <td><input type="number" class="quantidade" min="0" step="0.001" value="${item.quantidade || 0}"></td>
            <td>
                <select class="unidade">
                    <option value="">Selecione</option>
                </select>
            </td>
            <td><input type="text" class="custo-linha" value="R$ 0,00" readonly></td>
            <td><button type="button" class="btn-remover">❌</button></td>
        `;

        ingredientes.appendChild(linha);

        const input = linha.querySelector(".ingrediente");
        const qtd = linha.querySelector(".quantidade");
        const unidadeSelect = linha.querySelector(".unidade");

        input.addEventListener("input", () => atualizarUnidade(input));
        qtd.addEventListener("input", calcularCustoReceita);
        unidadeSelect.addEventListener("change", calcularCustoReceita);

        input.value = item.nome || "";
        qtd.value = item.quantidade || 0;

        if (item.unidade) {
            atualizarUnidade(input);
            unidadeSelect.value = item.unidade;
        }
    });

    calcularCustoReceita();
}

function calcularMargem(custo, preco) {
    const custoNum = Number(custo) || 0;
    const precoNum = Number(preco) || 0;
    if (custoNum === 0) return 0;
    return ((precoNum - custoNum) / custoNum * 100).toFixed(2);
}

function carregarEdicao() {
    const params = new URLSearchParams(window.location.search);
    const editMode = params.has("edit");

    if (!editMode) {
        localStorage.removeItem("receitaEditando");
        return;
    }

    const dados = localStorage.getItem("receitaEditando");
    if (!dados) return;

    const receita = JSON.parse(dados);
    if (!receita || !receita.id) return;

    receitaEditandoId = receita.id;

    document.getElementById("nomeReceita").value = receita.nome || "";
    document.getElementById("categoriaReceita").value = receita.categoria || "";
    document.getElementById("unidadeProducao").value = receita.unidade || "UN";
    custoReceita.value = Number(receita.custo || 0).toFixed(2);
    precoVenda.value = Number(receita.precoVenda || 0).toFixed(2);
    margemLucro.value = calcularMargem(receita.custo, receita.precoVenda);

    if (receita.foto) {
        imagemReceitaBase64 = receita.foto;
        previewImagem.src = receita.foto;
        previewImagem.style.display = "block";
    }

    renderizarIngredientes(receita.ingredientes || []);

    const titulo = document.querySelector(".page-header h1");
    if (titulo) {
        titulo.textContent = "✏️ Editar Receita";
    }

    const subtitulo = document.querySelector(".page-header p");
    if (subtitulo) {
        subtitulo.textContent = "Atualize os dados da receita abaixo.";
    }
}

// ======================
// IMAGEM
// ======================

let imagemReceitaBase64 = "";

fotoReceita?.addEventListener("change", (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        imagemReceitaBase64 = e.target.result;
        previewImagem.src = imagemReceitaBase64;
        previewImagem.style.display = "block";
    };

    reader.readAsDataURL(arquivo);
});

// ======================
// DATALIST
// ======================

function criarDatalistProdutos() {

    let datalist = document.getElementById("listaProdutos");

    if (!datalist) {
        datalist = document.createElement("datalist");
        datalist.id = "listaProdutos";
        document.body.appendChild(datalist);
    }

    const produtos = obterProdutos();

    datalist.innerHTML = produtos
        .map(p => `<option value="${p.nome}">`)
        .join("");
}

// ======================
// UNIDADE
// ======================

function atualizarUnidade(input) {

    const produtos = obterProdutos();

    const produto = produtos.find(p =>
        p.nome.toLowerCase() === input.value.toLowerCase()
    );

    const linha = input.closest("tr");
    const select = linha.querySelector(".unidade");

    if (!produto) {
        select.innerHTML = `<option value="">Selecione</option>`;
        return;
    }

    const unidade = (produto.unidade || "").toUpperCase();

    if (unidade === "KG") {
        select.innerHTML = `
            <option value="KG">KG</option>
            <option value="g">g</option>
        `;
    } else if (unidade === "L") {
        select.innerHTML = `
            <option value="L">L</option>
            <option value="ml">ml</option>
        `;
    } else {
        select.innerHTML = `<option value="${produto.unidade}">${produto.unidade}</option>`;
    }

    calcularCustoReceita();
}

// ======================
// CUSTO
// ======================

function calcularCustoReceita() {

    const produtos = obterProdutos();
    let total = 0;

    document.querySelectorAll("#ingredientes tr").forEach(linha => {

        const nome = linha.querySelector(".ingrediente").value;
        let qtd = parseFloat(linha.querySelector(".quantidade").value) || 0;
        const unidade = linha.querySelector(".unidade").value;

        const campo = linha.querySelector(".custo-linha");

        const produto = produtos.find(p =>
            p.nome.toLowerCase() === nome.toLowerCase()
        );

        if (!produto) {
            campo.value = "R$ 0,00";
            return;
        }

        const custoTotalProduto = parseFloat(produto.precoCusto) || 0;
        const qtdEstoque = parseFloat(produto.quantidade) || 1;

        if (produto.unidade === "KG" && unidade === "g") qtd /= 1000;
        if (produto.unidade === "L" && unidade === "ml") qtd /= 1000;

        const custoUnit = qtdEstoque > 0 ? custoTotalProduto / qtdEstoque : 0;

        const custoLinha = qtd * custoUnit;

        total += custoLinha;

        campo.value = `R$ ${custoLinha.toFixed(2)}`;
    });

    custoReceita.value = total.toFixed(2);

    calcularPrecoVenda();
}

// ======================
// PREÇO VENDA
// ======================

function calcularPrecoVenda() {

    const custo = parseFloat(custoReceita.value) || 0;
    const margem = parseFloat(margemLucro.value) || 0;

    precoVenda.value = (custo + (custo * margem / 100)).toFixed(2);
}

// ======================
// INGREDIENTE
// ======================

function adicionarIngrediente() {

    const linha = document.createElement("tr");

    linha.innerHTML = `
        <td><input type="text" class="ingrediente" list="listaProdutos"></td>
        <td><input type="number" class="quantidade" min="0" step="0.001"></td>
        <td>
            <select class="unidade">
                <option value="">Selecione</option>
            </select>
        </td>
        <td><input type="text" class="custo-linha" value="R$ 0,00" readonly></td>
        <td><button type="button" class="btn-remover">❌</button></td>
    `;

    ingredientes.appendChild(linha);

    const input = linha.querySelector(".ingrediente");
    const qtd = linha.querySelector(".quantidade");
    const unidade = linha.querySelector(".unidade");

    input.addEventListener("input", () => atualizarUnidade(input));
    qtd.addEventListener("input", calcularCustoReceita);
    unidade.addEventListener("change", calcularCustoReceita);
}

// ======================
// SALVAR RECEITA (IMPORTANTE)
// ======================

function salvarReceita() {

    const nome = document.getElementById("nomeReceita").value;
    const categoria = document.getElementById("categoriaReceita").value;

    if (!nome) {
        alert("Informe o nome da receita");
        return;
    }

    const ingredientes = [];

    document.querySelectorAll("#ingredientes tr").forEach(linha => {

        const nomeIng = linha.querySelector(".ingrediente").value;
        const qtd = parseFloat(linha.querySelector(".quantidade").value) || 0;
        const unidade = linha.querySelector(".unidade").value;

        if (nomeIng) {
            ingredientes.push({ nome: nomeIng, quantidade: qtd, unidade });
        }
    });

    const receita = {
        id: receitaEditandoId || Date.now(),
        nome,
        categoria,
        unidade: document.getElementById("unidadeProducao").value || "UN",
        ingredientes,
        custo: custoReceita.value,
        precoVenda: precoVenda.value,
        foto: imagemReceitaBase64
    };

    let receitas = obterReceitas();

    if (receitaEditandoId) {
        receitas = receitas.map(r =>
            r.id === receitaEditandoId ? receita : r
        );
        localStorage.removeItem("receitaEditando");
    } else {
        receitas.push(receita);
    }

    localStorage.setItem("receitas", JSON.stringify(receitas));

    mostrarMensagem("Receita salva com sucesso!");

    setTimeout(() => {
        window.location.href = "../receitasProducao.html";
    }, 1200);
}

// ======================
// TOAST
// ======================

function mostrarMensagem(texto) {

    const toast = document.createElement("div");

    toast.innerText = texto;

    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "#2ecc71";
    toast.style.color = "#fff";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = "9999";

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 1200);
}

// ======================
// EVENTOS
// ======================

btnAddIngrediente.addEventListener("click", adicionarIngrediente);

ingredientes.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-remover")) {
        e.target.closest("tr").remove();
        calcularCustoReceita();
    }
});

margemLucro.addEventListener("input", calcularPrecoVenda);

const formReceita = document.getElementById("formReceita");
formReceita?.addEventListener("submit", (e) => {
    e.preventDefault();
    salvarReceita();
});

// ======================
// INIT
// ======================

document.addEventListener("DOMContentLoaded", () => {
    criarDatalistProdutos();
    carregarEdicao();

    if (!receitaEditandoId) {
        adicionarIngrediente();
    }
});