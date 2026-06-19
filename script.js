// ==========================
// ACESSO RÁPIDO
// ==========================

document.addEventListener(
    "DOMContentLoaded",
    carregarAcessoRapido
);

function carregarAcessoRapido(){

    carregarEstoqueBaixo();
    carregarUltimosClientes();
    carregarMaisVendidos();
    carregarAlertas();
    carregarResumoDia();
    carregarUltimasVendas();

}

// ==========================
// ESTOQUE BAIXO
// ==========================

function carregarEstoqueBaixo(){

    const estoque =
        JSON.parse(
            localStorage.getItem("estoque")
        ) || [];

    const baixos =
        estoque.filter(
            p => Number(p.quantidade) <= 5
        );

    const contador =
        document.getElementById(
            "contadorEstoque"
        );

    if(contador){

        contador.textContent =
            `${baixos.length} produtos`;

    }

}

// ==========================
// ÚLTIMOS CLIENTES
// ==========================

function carregarUltimosClientes(){

    const clientes =
        JSON.parse(
            localStorage.getItem("clientes")
        ) || [];

    const contador =
        document.getElementById(
            "contadorClientes"
        );

    if(contador){

        contador.textContent =
            `${clientes.length} clientes`;

    }

}

// ==========================
// MAIS VENDIDOS
// ==========================

function carregarMaisVendidos(){

    const vendas =
        JSON.parse(
            localStorage.getItem("vendas")
        ) || [];

    const mapa = {};

    vendas.forEach(venda => {

        // ignora vendas antigas ou inválidas
        if(
            !venda.produtos ||
            !Array.isArray(venda.produtos)
        ){
            return;
        }

        venda.produtos.forEach(produto => {

            if(
                !mapa[produto.nome]
            ){
                mapa[produto.nome] = 0;
            }

            mapa[produto.nome] +=
                Number(
                    produto.quantidade
                ) || 0;

        });

    });

    window.produtosMaisVendidos =
        Object.entries(mapa)
        .sort(
            (a,b) => b[1] - a[1]
        );

}

// ==========================
// MODAL
// ==========================

const modal =
    document.getElementById(
        "modalDashboard"
    );

const modalTitulo =
    document.getElementById(
        "modalTitulo"
    );

const modalConteudo =
    document.getElementById(
        "modalConteudo"
    );

document
.getElementById("fecharModal")
.addEventListener(
    "click",
    () => {

        modal.style.display = "none";

    }
);

// ==========================
// ESTOQUE BAIXO
// ==========================

document
.getElementById("btnEstoqueBaixo")
.addEventListener(
    "click",
    () => {

        const estoque =
            JSON.parse(
                localStorage.getItem(
                    "estoque"
                )
            ) || [];

        const baixos =
            estoque.filter(
                p =>
                Number(
                    p.quantidade
                ) <= 5
            );

        modalTitulo.innerHTML =
            "📦 Estoque Baixo";

        modalConteudo.innerHTML = "";

        if(
            baixos.length == 0
        ){

            modalConteudo.innerHTML =
            "<p>Nenhum produto.</p>";

        }else{

            baixos.forEach(p=>{

                modalConteudo.innerHTML += `

                <div class="modal-item">

                    <strong>
                        ${p.nome}
                    </strong>

                    <span>

                        ${p.quantidade}
                        ${p.unidade}

                    </span>

                </div>

                `;

            });

        }

        modal.style.display =
            "flex";

    }
);

// ==========================
// ÚLTIMOS CLIENTES
// ==========================

document
.getElementById("btnUltimosClientes")
.addEventListener(
    "click",
    () => {

        const clientes =
            JSON.parse(
                localStorage.getItem(
                    "clientes"
                )
            ) || [];

        modalTitulo.innerHTML =
            "👥 Últimos Clientes";

        modalConteudo.innerHTML = "";

        clientes
        .slice(-10)
        .reverse()
        .forEach(cliente=>{

            modalConteudo.innerHTML += `

            <div class="modal-item">

                <strong>

                    ${cliente.nome}

                </strong>

                <span>

                    ${cliente.telefone}

                </span>

            </div>

            `;

        });

        modal.style.display =
            "flex";

    }
);

// ==========================
// MAIS VENDIDOS
// ==========================

document
.getElementById("btnMaisVendidos")
.addEventListener(
    "click",
    () => {

        modalTitulo.innerHTML =
            "🔥 Produtos Mais Vendidos";

        modalConteudo.innerHTML = "";

        if(
            !window.produtosMaisVendidos
        ){

            modalConteudo.innerHTML =
            "<p>Nenhuma venda.</p>";

        }else{

            window
            .produtosMaisVendidos
            .slice(0,5)
            .forEach(
                item=>{

                modalConteudo.innerHTML += `

                <div class="modal-item">

                    <strong>

                        ${item[0]}

                    </strong>

                    <span>

                        ${item[1]}
                        vendas

                    </span>

                </div>

                `;

            });

        }

        modal.style.display =
            "flex";

    }
);

// ==========================
// ALERTAS
// ==========================

document
.getElementById("btnAlertas")
.addEventListener(
    "click",
    () => {

        const estoque =
            JSON.parse(
                localStorage.getItem(
                    "estoque"
                )
            ) || [];

        const baixos =
            estoque.filter(
                p=>
                Number(
                    p.quantidade
                ) <= 5
            );

        modalTitulo.innerHTML =
            "🚨 Alertas do Sistema";

        modalConteudo.innerHTML = `

        <div class="modal-item">

            <strong>

                Produtos com estoque baixo

            </strong>

            <span>

                ${baixos.length}

            </span>

        </div>

        `;

        modal.style.display =
            "flex";

    }
);

// ==========================
// ALERTAS
// ==========================

function carregarAlertas(){

    const estoque =
        JSON.parse(
            localStorage.getItem("estoque")
        ) || [];

    const baixos =
        estoque.filter(
            p => Number(p.quantidade) <= 5
        ).length;

    const contador =
        document.getElementById(
            "contadorAlertas"
        );

    if(contador){

        contador.textContent =
            `${baixos} alertas`;

    }

}

// ======================
// LOGIN
// ======================

const logado = localStorage.getItem("logado");
const usuarioLogado =
    localStorage.getItem("usuario") || "Usuário";

if (logado !== "true") {
    window.location.href = "/index.html";
} else {
    const nomeUsuarioEl =
        document.getElementById("nomeUsuario");

    if (nomeUsuarioEl) {
        nomeUsuarioEl.textContent = usuarioLogado;
    }
}

const btnSair =
    document.getElementById("btnSair");

if (btnSair) {
    btnSair.addEventListener(
        "click",
        () => {
            localStorage.removeItem("logado");
            localStorage.removeItem("usuario");
            window.location.href = "/index.html";
        }
    );
}

// ======================
// RESUMO DO DIA
// ======================

function parseDataBr(dataString) {
    if (!dataString) return null;

    const texto = String(dataString).replace(/\u00A0/g, " ").trim();

    const match = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
        const dia = Number(match[1]);
        const mes = Number(match[2]) - 1;
        const ano = Number(match[3]);

        if (!Number.isNaN(dia) && !Number.isNaN(mes) && !Number.isNaN(ano)) {
            return new Date(ano, mes, dia);
        }
    }

    const timestamp = Date.parse(texto);
    return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

function carregarResumoDia(){

    const vendas =
        JSON.parse(
            localStorage.getItem("vendas")
        ) || [];

    const hoje = new Date();
    const hojeSemHora = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    );

    const vendasHoje = vendas.filter(venda => {
        if (venda.status === "Cancelado") return false;

        const dataVenda = parseDataBr(venda.data);
        if (!dataVenda) return false;

        const vendaSemHora = new Date(
            dataVenda.getFullYear(),
            dataVenda.getMonth(),
            dataVenda.getDate()
        );

        return vendaSemHora.getTime() === hojeSemHora.getTime();
    });

    let faturamento = 0;

    vendasHoje.forEach(venda => {

        let valor =
            venda.total || 0;

        if(
            typeof valor === "string"
        ){

            valor =
                valor
                .replace("R$", "")
                .replace(/\s/g, "")
                .replace(".", "")
                .replace(",", ".");

        }

        faturamento +=
            Number(valor) || 0;

    });

    const pedidos =
        vendasHoje.length;

    const ticket =

        pedidos > 0

        ? faturamento / pedidos

        : 0;

    document.getElementById(
        "faturamento"
    ).textContent =
        formatarMoeda(
            faturamento
        );

    document.getElementById(
        "ticket"
    ).textContent =
        formatarMoeda(
            ticket
        );

    document.getElementById(
        "pedidos"
    ).textContent =
        pedidos;

}

function carregarUltimasVendas(){

    // Ler vendas salvas do localStorage
    const vendas =
        JSON.parse(
            localStorage.getItem("vendas")
        ) || [];

    // Pegar as últimas 4 vendas e mostrar da mais recente para a mais antiga
    const ultimas =
        vendas
        .slice(-4)
        .reverse();

    const tbody =
        document.getElementById(
            "listaUltimasVendas"
        );

    if(!tbody){
        return;
    }

    if(ultimas.length === 0){
        tbody.innerHTML = `
            <tr>
                <td colspan="4">Nenhuma venda encontrada</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";

    ultimas.forEach(venda => {
        const cliente =
            venda.cliente && venda.cliente.nome
            ? venda.cliente.nome
            : "Sem cliente";

        const total =
            Number(venda.total) || 0;

        // Montar cada linha da tabela com data-labels para exibição no mobile
        tbody.innerHTML += `
            <tr>
                <td data-label="ID">#${venda.id}</td>
                <td data-label="Cliente">${cliente}</td>
                <td data-label="Pagamento">${venda.pagamento || "-"}</td>
                <td data-label="Total">${formatarMoeda(total)}</td>
            </tr>
        `;
    });

}

// ======================
// CARDS DO TOPO
// ======================

function carregarCardsTopo(){

    const produtos =
        JSON.parse(
            localStorage.getItem("estoque")
        ) || [];

    const vendas =
        JSON.parse(
            localStorage.getItem("vendas")
        ) || [];

    const clientes =
        JSON.parse(
            localStorage.getItem("clientes")
        ) || [];

    // PRODUTOS

    document.getElementById(
        "totalProdutos"
    ).textContent =
        produtos.length;

    // VENDAS

    let totalVendas = 0;

    vendas.forEach(venda => {

        let valor =
            venda.total || 0;

        if(
            typeof valor === "string"
        ){

            valor =
                valor
                .replace("R$", "")
                .replace(/\s/g, "")
                .replace(".", "")
                .replace(",", ".");

        }

        totalVendas +=
            Number(valor) || 0;

    });

    document.getElementById(
        "totalVendas"
    ).textContent =
        formatarMoeda(
            totalVendas
        );

    // CLIENTES

    document.getElementById(
        "totalClientes"
    ).textContent =
        clientes.length;

}

// ======================
// INICIAR
// ======================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarCardsTopo();

    }
);
