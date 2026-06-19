const listaEstoque = document.getElementById("listaEstoque");
const buscarEstoque = document.getElementById("buscarEstoque");

function obterProdutos() {
    return JSON.parse(localStorage.getItem("estoque")) || [];
}

function carregarEstoque(produtos = obterProdutos()) {

    listaEstoque.innerHTML = "";

    let baixoEstoque = 0;
    let semEstoque = 0;
    let valorTotal = 0;

    produtos.forEach(produto => {

        let status = "ok";
        let textoStatus = "Normal";

        if (produto.quantidade <= 10) {
            status = "warning";
            textoStatus = "Baixo";
            baixoEstoque++;
        }

        if (produto.quantidade <= 0) {
            status = "danger";
            textoStatus = "Zerado";
            semEstoque++;
        }

        const quantidade = Number(produto.quantidade);
        const preco = parseFloat(
            String(produto.precoCusto).replace(",", ".")
        );

valorTotal += quantidade * preco;

        listaEstoque.innerHTML += `
            <tr>

                <td>${produto.nome}</td>

<td>${produto.categoria}</td>

<td>
    ${produto.quantidade}
    ${produto.unidade}
</td>
<td>
    ${formatarMoeda(
        produto.precoCusto
    )}
</td>

<td class="valor-estoque">
    ${formatarMoeda(
        Number(produto.quantidade) *
        parseFloat(String(produto.precoCusto).replace(",", "."))
    )}
</td>

<td>
    <span class="status ${status}">
        ${textoStatus}
    </span>
</td>
            </tr>
        `;
    });

    document.getElementById("totalProdutos").textContent =
        produtos.length;

    document.getElementById("estoqueBaixo").textContent =
        baixoEstoque;

    document.getElementById("semEstoque").textContent =
        semEstoque;

    document.getElementById("valorEstoque").textContent =
    formatarMoeda(valorTotal);
}

buscarEstoque.addEventListener("input", () => {

    const termo =
        buscarEstoque.value.toLowerCase();

    const produtos = obterProdutos();

    const filtrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(termo)
    );

    carregarEstoque(filtrados);
});

const botoesFiltro = document.querySelectorAll(".filter-btn");

botoesFiltro.forEach(botao => {

    botao.addEventListener("click", () => {

        botoesFiltro.forEach(btn =>
            btn.classList.remove("active-filter")
        );

        botao.classList.add("active-filter");

        aplicarFiltro(botao.dataset.filter);

    });

});

function aplicarFiltro(filtro) {

    const produtos = obterProdutos();

    let listaFiltrada = produtos;

    switch (filtro) {

        case "baixo":
            listaFiltrada = produtos.filter(
                produto => produto.quantidade > 0 &&
                produto.quantidade <= 10
            );
            break;

        case "zerado":
            listaFiltrada = produtos.filter(
                produto => produto.quantidade <= 0
            );
            break;

        case "bebidas":
            listaFiltrada = produtos.filter(
                produto => produto.categoria.toLowerCase() === "bebidas"
            );
            break;

        case "alimentos":
            listaFiltrada = produtos.filter(
                produto => produto.categoria.toLowerCase() === "alimentos"
            );
            break;

        default:
            listaFiltrada = produtos;
    }

    carregarEstoque(listaFiltrada);
}
document.querySelector(".new-stock")
    .addEventListener("click", () => {
        alert("Funcionalidade em desenvolvimento.");
    });

carregarEstoque();