const listaProdutos =
    document.getElementById("listaProdutos");

const btnFinalizarVenda =
    document.getElementById("btnFinalizarVenda");

const carrinhoItens =
    document.getElementById("carrinhoItens");

const totalVenda =
    document.getElementById("totalVenda");

const buscarProduto =
    document.getElementById("buscarProduto");

const operadorNome =
    document.getElementById("operadorNome");

const btnSairCaixa =
    document.getElementById("btnSairCaixa");

let carrinho = [];
let produtosExibidos = [];

// 🔥 controla se já pediu cliente nesta venda
let clienteSolicitado = false;

// ======================
// LOGIN / USUÁRIO

const logadoCaixa = localStorage.getItem("logado");
const usuarioCaixa =
    localStorage.getItem("usuario") || "Operador";

if (logadoCaixa !== "true") {
    window.location.href = "/index.html";
} else if (operadorNome) {
    operadorNome.textContent = usuarioCaixa;
}

if (btnSairCaixa) {
    btnSairCaixa.addEventListener(
        "click",
        () => {
            localStorage.removeItem("logado");
            localStorage.removeItem("usuario");
            window.location.href = "/index.html";
        }
    );
}

// ======================
// PRODUTOS
// ======================
function obterProdutos() {
    return JSON.parse(localStorage.getItem("estoque")) || [];
}

// ======================
// MOSTRAR PRODUTOS TELA
// ======================
function adicionarProdutoTela(produto){

    const jaExiste =
        produtosExibidos.find(p => p.id == produto.id);

    if(jaExiste){
        produtosExibidos =
            produtosExibidos.filter(p => p.id != produto.id);
    }

    produtosExibidos.push(produto);

    if(produtosExibidos.length > 3){
        produtosExibidos.shift();
    }

    renderizarProdutosTela();
}

function renderizarProdutosTela(){

    listaProdutos.innerHTML = "";

    produtosExibidos.forEach(produto => {

        listaProdutos.innerHTML += `
            <div class="product-card">
                <img
                    src="${
                        produto.imagem && produto.imagem.trim() !== ""
                        ? produto.imagem
                        : "img/sem-imagem.png"
                    }"
                    alt="${produto.nome}"
                >
            </div>
        `;
    });
}

// ======================
// BUSCAR PRODUTO
// ======================
buscarProduto.addEventListener("keydown", (e) => {

    if(e.key !== "Enter") return;

    let texto = buscarProduto.value.trim();

    if(texto === "") return;

    let quantidade = 1;
    let busca = texto;

    if(texto.includes("*")){
        const partes = texto.split("*");

        quantidade = parseInt(partes[0]);
        busca = partes[1].trim();

        if(isNaN(quantidade) || quantidade <= 0){
            quantidade = 1;
        }
    }

    const produtos = obterProdutos();

    const produto = produtos.find(p =>
        p.codigoBarras.toString().toLowerCase() === busca.toLowerCase()
        ||
        p.nome.toLowerCase().includes(busca.toLowerCase())
    );

    if(!produto){
        alert("Produto não encontrado.");
        buscarProduto.value = "";
        return;
    }

    for(let i = 0; i < quantidade; i++){
        adicionarCarrinho(produto.id);
    }

    buscarProduto.value = "";
});

// ======================
// CLIENTE MODAL
// ======================
const clientModal = document.getElementById("clientModal");
const clientSearch = document.getElementById("clientSearch");
const clientCPF = document.getElementById("clientCPF");
const suggestionsBox = document.getElementById("suggestions");
const confirmClientBtn = document.getElementById("confirmClient");

let selectedClient = null;

function getClientes() {
    return JSON.parse(localStorage.getItem("clientes")) || [];
}

function openClientModal() {
    clientModal.style.display = "flex";
    clientSearch.focus();
}

function closeClientModal() {
    clientModal.style.display = "none";
    clientSearch.value = "";
    clientCPF.value = "";
    suggestionsBox.innerHTML = "";
    selectedClient = null;
}

// busca
clientSearch.addEventListener("input", () => {

    const value = clientSearch.value.toLowerCase();

    const clientes = getClientes();

    const filtered = clientes.filter(c =>
        c.nome.toLowerCase().includes(value)
    );

    renderSuggestions(filtered);
});

function renderSuggestions(list) {

    suggestionsBox.innerHTML = "";

    list.slice(0, 5).forEach(cliente => {

        const div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.textContent = cliente.nome;

        div.onclick = () => selectClient(cliente);

        suggestionsBox.appendChild(div);
    });
}

function selectClient(cliente) {

    selectedClient = cliente;

    clientSearch.value = cliente.nome;
    clientCPF.value = cliente.cpf || "";

    suggestionsBox.innerHTML = "";
}

// ENTER
clientSearch.addEventListener("keydown", (e) => {

    if(e.key === "Enter"){

        const clientes = getClientes();

        const found = clientes.find(c =>
            c.nome.toLowerCase() === clientSearch.value.toLowerCase()
        );

        if(found){
            selectClient(found);
        }

        confirmClient();
    }
});

confirmClientBtn.addEventListener("click", confirmClient);

function confirmClient() {

    const clienteFinal = {
        nome: selectedClient ? selectedClient.nome : clientSearch.value,
        cpf: clientCPF.value || (selectedClient?.cpf || "")
    };

    window.vendaAtual = window.vendaAtual || {};
    window.vendaAtual.cliente = clienteFinal;

    // 🚀 ATUALIZA NA TELA DO CAIXA
    atualizarClienteTela(clienteFinal);

    closeClientModal();

    console.log("Cliente selecionado:", clienteFinal);
}

// ======================
// CARRINHO
// ======================
function adicionarCarrinho(id){

    const produtos = obterProdutos();

    const produto = produtos.find(p => p.id == id);

    if(!produto) return;

    if(Number(produto.quantidade) <= 0){
        alert("Produto sem estoque.");
        return;
    }

    adicionarProdutoTela(produto);

    const item = carrinho.find(i => i.id == id);

    if(item){
        item.quantidade++;
    } else {
        carrinho.push({
            id: produto.id,
            codigoBarras: produto.codigoBarras,
            nome: produto.nome,
            preco: Number(produto.precoVenda),
            quantidade: 1
        });
    }

    atualizarCarrinho();

    // 🔥 AQUI ESTÁ O FIX PRINCIPAL
    if(!clienteSolicitado && carrinho.length === 1){
        openClientModal();
        clienteSolicitado = true;
    }

    buscarProduto.value = "";
}

// ======================
// ATUALIZAR CARRINHO
// ======================
function atualizarCarrinho(){

    carrinhoItens.innerHTML = "";

    let total = 0;

    carrinho.forEach(item => {

        total += item.preco * item.quantidade;

        carrinhoItens.innerHTML += `
            <div class="cart-item">
                <div>
                    <h4>${item.nome}</h4>
                    <p>${item.quantidade}x ${formatarMoeda(item.preco)}</p>
                </div>
                <span>${formatarMoeda(item.preco * item.quantidade)}</span>
            </div>
        `;
    });

    totalVenda.textContent = formatarMoeda(total);
}

function atualizarClienteTela(cliente) {

    const nomeEl = document.getElementById("clienteNome");
    const cpfEl = document.getElementById("clienteCPF");

    if(!cliente){
        nomeEl.textContent = "Não selecionado";
        cpfEl.textContent = "";
        return;
    }

    nomeEl.textContent = cliente.nome || "Sem nome";
    cpfEl.textContent = cliente.cpf ? `CPF: ${cliente.cpf}` : "";

}

// ======================
// FINALIZAR VENDA
// ======================
function finalizarVenda() {

    if(carrinho.length === 0){
        alert("Carrinho vazio.");
        return;
    }

    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];

    const formaPagamento =
        document.getElementById("formaPagamento").value;

    const total = carrinho.reduce(
        (soma, item) => soma + (item.preco * item.quantidade),
        0
    );

    const venda = {
        id: Date.now(),
        data: new Date().toLocaleString("pt-BR"),
        pagamento: formaPagamento,
        total: total,
        status: "Pago",
        produtos: [...carrinho],
        cliente: window.vendaAtual?.cliente || null
    };

    vendas.push(venda);

    localStorage.setItem("vendas", JSON.stringify(vendas));

    // estoque
    let estoque = obterProdutos();

    carrinho.forEach(item => {

        const produto = estoque.find(p => p.id == item.id);

        if(produto){
            produto.quantidade -= item.quantidade;
        }
    });

    localStorage.setItem("estoque", JSON.stringify(estoque));

    carrinho = [];
    produtosExibidos = [];
    clienteSolicitado = false;
    window.vendaAtual = {};

    atualizarCarrinho();
    renderizarProdutosTela();

    // 🔥 LIMPA CLIENTE DA TELA
    atualizarClienteTela(null);

    buscarProduto.value = "";
    buscarProduto.focus();

    alert("Venda realizada com sucesso!");
}

// ======================
// EVENTOS
// ======================
btnFinalizarVenda.addEventListener("click", finalizarVenda);
