// =====================
// ELEMENTOS
// =====================

let buscarVenda;
let filtroPeriodo;

// =====================
// OBTER VENDAS
// =====================

function obterVendas(){

    return JSON.parse(

        localStorage.getItem(
            "vendas"
        )

    ) || [];

}


// =====================
// ATUALIZAR CARDS
// =====================

function atualizarCards(lista = obterVendas()) {

    let valor = 0;
    let pedidos = 0;
    let canceladas = 0;

    lista.forEach(venda => {

        const total = Number(venda.total) || 0;

        if (venda.status === "Cancelado") {
            canceladas++;
            return;
        }

        pedidos++;
        valor += total;

    });

    const ticketMedio = pedidos > 0
        ? valor / pedidos
        : 0;

    document.getElementById("vendasHoje").textContent =
        formatarMoeda(valor);

    document.getElementById("totalPedidos").textContent =
        pedidos;

    document.getElementById("ticketMedio").textContent =
        formatarMoeda(ticketMedio);

    document.getElementById("vendasCanceladas").textContent =
        canceladas;
}

function calcularResumoVendas(vendas) {
    let valorTotal = 0;
    let totalPedidos = 0;
    let cancelados = 0;

    vendas.forEach(venda => {
        const total = Number(venda.total) || 0;

        if (venda.status === "Cancelado") {
            cancelados++;
            return;
        }

        totalPedidos++;
        valorTotal += total;
    });

    const ticketMedio = totalPedidos > 0
        ? valorTotal / totalPedidos
        : 0;

    return {
        valorTotal,
        totalPedidos,
        ticketMedio,
        cancelados
    };
}

function aplicarFiltro(vendas, filtro) {

    if (filtro === "todos") {

        const resumo = calcularResumoVendas(vendas);

        const valorTotalEl =
            document.getElementById(
                "valorTotal"
            );

        if (valorTotalEl) {
            valorTotalEl.innerText =
                formatarMoeda(resumo.valorTotal);
        }

        document.getElementById("totalPedidos").innerText =
            resumo.totalPedidos;

        document.getElementById("ticketMedio").innerText =
            formatarMoeda(resumo.ticketMedio);

        document.getElementById("vendasCanceladas").innerText =
            resumo.cancelados;

    }

    atualizarTabela(vendas);
}

// =====================
// ATUALIZAR TABELA
// =====================

function atualizarTabela(vendas) {

    const tbody = document.getElementById("listaVendas");

    tbody.innerHTML = "";

    vendas.forEach(venda => {

        const total = Number(venda.total) || 0;

        const statusClass =
            venda.status === "Cancelado"
                ? "cancelado"
                : "paid";

        tbody.innerHTML += `
            <tr>

                <td>#${venda.id}</td>

                <td>${venda.data}</td>

                <td>
                    ${Array.isArray(venda.produtos) ? venda.produtos.length : 0} itens
                </td>

                <td class="valor-venda">
                    ${formatarMoeda(total)}
                </td>

                <td>
                    ${venda.pagamento}
                </td>

                <td>
                    <span class="status ${statusClass}">
                        ${venda.status}
                    </span>
                </td>

                <td>

                    <button class="btn-acao visualizar"
                        onclick="verVenda(${venda.id})">
                        👁️
                    </button>

                    <button class="btn-acao comprovante"
                        onclick="imprimirVenda(${venda.id})">
                        🧾
                    </button>

                    <button class="btn-acao cancelar"
                        onclick="cancelarVenda(${venda.id})">
                        ❌
                    </button>

                </td>

            </tr>
        `;
    });
}

function parseDataBr(dataString) {
    if (!dataString) return null;

    const texto =
        String(dataString)
            .replace(/\u00A0/g, " ")
            .trim();

    const match =
        texto.match(
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/
        );

    if (match) {
        const dia = Number(match[1]);
        const mes = Number(match[2]) - 1;
        const ano = Number(match[3]);

        if (
            !Number.isNaN(dia) &&
            !Number.isNaN(mes) &&
            !Number.isNaN(ano)
        ) {
            return new Date(ano, mes, dia);
        }
    }

    const timestamp = Date.parse(texto);
    return Number.isNaN(timestamp)
        ? null
        : new Date(timestamp);
}

function filtrarPorPeriodo(vendas, periodo) {
    if (periodo === "todos") {
        return vendas;
    }

    const hoje = new Date();
    const hojeSemHora = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    );

    return vendas.filter(venda => {
        const dataVenda = parseDataBr(venda.data);
        if (!dataVenda) return false;

        const vendaSemHora = new Date(
            dataVenda.getFullYear(),
            dataVenda.getMonth(),
            dataVenda.getDate()
        );

        if (periodo === "hoje") {
            return vendaSemHora.getTime() === hojeSemHora.getTime();
        }

        if (periodo === "mes") {
            return (
                vendaSemHora.getMonth() === hojeSemHora.getMonth() &&
                vendaSemHora.getFullYear() === hojeSemHora.getFullYear()
            );
        }

        const diferenca = Math.round(
            (hojeSemHora - vendaSemHora) /
            (1000 * 60 * 60 * 24)
        );

        if (periodo === "7dias") {
            return diferenca >= 0 && diferenca <= 7;
        }

        return true;
    });
}

// =====================
// VER VENDA
// =====================

function verVenda(id){

    const vendas =
        obterVendas();

    const venda =
        vendas.find(
            v => v.id == id
        );

    if(!venda){
        return;
    }

    let produtosHTML = "";

    (Array.isArray(venda.produtos) ? venda.produtos : [])
        .forEach(produto => {

        produtosHTML += `

            <div class="item-venda">

                <span>

                    ${produto.quantidade}x
                    ${produto.nome}

                </span>

                <span>

                    ${formatarMoeda(

                        produto.preco *
                        produto.quantidade

                    )}

                </span>

            </div>

        `;

    });

    document.getElementById(
        "conteudoVenda"
    ).innerHTML = `

        <div class="info-venda">

            <p>

                <strong>Venda:</strong>

                #${venda.id}

            </p>

            <p>

                <strong>Data:</strong>

                ${venda.data}

            </p>

            <p>

                <strong>Pagamento:</strong>

                ${venda.pagamento}

            </p>

            <p>

                <strong>Status:</strong>

                ${venda.status}

            </p>

        </div>

        <div class="lista-produtos">

            ${produtosHTML}

        </div>

        <div class="total-venda-modal">

            Total:

            ${formatarMoeda(
                venda.total
            )}

        </div>

    `;

    document.getElementById(
        "modalVenda"
    ).style.display =
        "flex";

}

// =====================
// FECHAR MODAL
// =====================

function fecharModalVenda(){

    document.getElementById(
        "modalVenda"
    ).style.display =
        "none";

}

// =====================
// FECHAR AO CLICAR FORA
// =====================

window.addEventListener(

    "click",

    function(e){

        const modal =

            document.getElementById(
                "modalVenda"
            );

        if(
            e.target === modal
        ){

            modal.style.display =
                "none";

        }

    }

);

// =====================
// IMPRESSÃO
// =====================

function imprimirVenda(id){

    const vendas =
        obterVendas();

    const venda =
        vendas.find(
            v => v.id == id
        );

    if(!venda){
        return;
    }

    alert(

        "Impressão de cupom em desenvolvimento."

    );

}

// =====================
// CANCELAR VENDA
// =====================

function cancelarVenda(id){

    if(

        !confirm(

            "Deseja realmente cancelar esta venda?"

        )

    ){

        return;

    }

    let vendas =

        obterVendas();

    const venda =

        vendas.find(

            v => v.id == id

        );

    if(!venda){

        alert(

            "Venda não encontrada."

        );

        return;

    }

    if(

        venda.status ===
        "Cancelado"

    ){

        alert(

            "Esta venda já foi cancelada."

        );

        return;

    }

    // =====================
    // DEVOLVER AO ESTOQUE
    // =====================

    let estoque =

        JSON.parse(

            localStorage.getItem(
                "estoque"
            )

        ) || [];

    venda.produtos.forEach(item => {

        const produto =

            estoque.find(

                p =>

                p.id == item.id

            );

        if(produto){

            produto.quantidade =

                Number(
                    produto.quantidade
                )

                +

                Number(
                    item.quantidade
                );

        }

    });

    localStorage.setItem(

        "estoque",

        JSON.stringify(
            estoque
        )

    );

    // =====================
    // ALTERAR STATUS
    // =====================

    venda.status =
        "Cancelado";

    localStorage.setItem(

        "vendas",

        JSON.stringify(
            vendas
        )

    );

    alert(

        "Venda cancelada com sucesso!"

    );

    // =====================
    // ATUALIZAR TELA
    // =====================

    filtrarVendas();

}

// =====================
// RECARREGAR DADOS
// =====================

function atualizarSistema(){

    filtrarVendas();

}

function carregarVendas(){

    filtrarVendas();

}

// =====================
// FILTRAR VENDAS
// =====================

function filtrarVendas(){

    const texto =

        buscarVenda
        .value
        .trim()
        .toLowerCase();

    const periodo =

        filtroPeriodo
        .value;

    let vendas =

        obterVendas();

    vendas =

        filtrarPorPeriodo(
            vendas,
            periodo
        );

    // =====================
    // BUSCA
    // =====================

    if (texto !== "") {

        vendas =

            vendas.filter(

                venda => {

                    const encontrouProduto =

                        Array.isArray(venda.produtos) &&
                        venda.produtos.some(

                            produto =>

                            produto.nome
                            .toLowerCase()
                            .includes(
                                texto
                            )

                        );

                    return (

                        venda.id
                        .toString()
                        .includes(
                            texto
                        )

                        ||

                        (venda.pagamento || "")

                    );

                }

            );

    }

    // =====================
    // ATUALIZA TELA
    // =====================

    const vendasOrdenadas =

        [...vendas]
        .reverse();

    atualizarTabela(

        vendasOrdenadas

    );

    atualizarCards(

        vendasOrdenadas

    );

}

// =====================
// INICIALIZAÇÃO
// =====================

function iniciarSistema(){

    buscarVenda =
        document.getElementById(
            "buscarVenda"
        );

    filtroPeriodo =
        document.getElementById(
            "filtroPeriodo"
        );

    if (
        buscarVenda &&
        filtroPeriodo
    ) {
        buscarVenda.addEventListener(
            "input",
            filtrarVendas
        );

        filtroPeriodo.addEventListener(
            "change",
            filtrarVendas
        );
    }

    carregarVendas();

}

// =====================
// TECLA ESC FECHA MODAL
// =====================

document.addEventListener(

    "keydown",

    function(e){

        if(

            e.key ===
            "Escape"

        ){

            const modal =

                document.getElementById(
                    "modalVenda"
                );

            if(

                modal.style.display
                ===
                "flex"

            ){

                fecharModalVenda();

            }

        }

    }

);

// =====================
// RECARREGAR AO ALTERAR
// LOCALSTORAGE
// =====================

window.addEventListener(

    "storage",

    function(){

        filtrarVendas();

    }

);

// =====================
// IMPRESSÃO FUTURA
// =====================

function gerarCupom(venda){

    let cupom = "";

    cupom +=
        "================================\n";

    cupom +=
        "         SUPERMARKET\n";

    cupom +=
        "================================\n\n";

    cupom +=
        "Venda: #" +
        venda.id +
        "\n";

    cupom +=
        "Data: " +
        venda.data +
        "\n";

    cupom +=
        "Pagamento: " +
        venda.pagamento +
        "\n\n";

    venda.produtos.forEach(

        produto => {

            cupom +=

                produto.quantidade +
                "x " +

                produto.nome +

                " - " +

                formatarMoeda(

                    produto.preco *
                    produto.quantidade

                )

                +

                "\n";

        }

    );

    cupom +=
        "\n--------------------------------\n";

    cupom +=
        "TOTAL: " +

        formatarMoeda(
            venda.total
        );

    return cupom;

}

// =====================
// FUTURAS MELHORIAS
// =====================

// gerar PDF
// imprimir térmica
// exportar Excel
// exportar CSV
// enviar WhatsApp
// enviar Email

// =====================
// START
// =====================

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        iniciarSistema
    );
} else {
    iniciarSistema();
}