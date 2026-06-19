// ======================
// ELEMENTOS
// ======================
const tbody = document.querySelector("tbody");
const inputBusca = document.querySelector(".search-area input");

// CARDS
const totalClientesEl = document.querySelector(".cards .blue p");
const ativosEl = document.querySelector(".cards .green p");
const novosEl = document.querySelector(".cards .orange p");
const inativosEl = document.querySelector(".cards .red p");

// ======================
// GET CLIENTES
// ======================
function getClientes() {
    return JSON.parse(localStorage.getItem("clientes")) || [];
}

// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", () => {
    renderClientes(getClientes());
});

// ======================
// RENDER
// ======================
function renderClientes(lista) {

    tbody.innerHTML = "";

    if (!lista.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">Nenhum cliente cadastrado</td>
            </tr>
        `;
        return;
    }

    lista.forEach(cliente => {

        tbody.innerHTML += `
        <tr>
            <td>#${cliente.id}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.email}</td>
            <td>${cliente.cidade}</td>

            <td>
                <span class="status ${cliente.status === "Ativo" ? "active" : "inactive"}">
                    ${cliente.status}
                </span>
            </td>

            <td>
                <button class="view" onclick="verCliente(${cliente.id})">👁️</button>
                <button class="edit" onclick="editarCliente(${cliente.id})">✏️</button>
                <button class="delete" onclick="excluirCliente(${cliente.id})">🗑️</button>
            </td>
        </tr>
        `;
    });

    atualizarCards(lista);
}

// ======================
// CARDS
// ======================
function atualizarCards(lista) {

    const total = lista.length;
    const ativos = lista.filter(c => c.status === "Ativo").length;
    const inativos = lista.filter(c => c.status === "Inativo").length;

    // últimos 30 dias (simples por ID como base)
    const novos = lista.filter(c => c.novo === true).length;

    totalClientesEl.textContent = total;
    ativosEl.textContent = ativos;
    inativosEl.textContent = inativos;
    novosEl.textContent = novos;
}

// ======================
// BUSCA
// ======================
if (inputBusca) {
    inputBusca.addEventListener("input", () => {

        const texto = inputBusca.value.toLowerCase();

        const filtrados = getClientes().filter(c =>
            c.nome.toLowerCase().includes(texto) ||
            c.email.toLowerCase().includes(texto) ||
            c.cidade.toLowerCase().includes(texto)
        );

        renderClientes(filtrados);
    });
}

// ======================
// EXCLUIR
// ======================
function excluirCliente(id) {

    if (!confirm("Deseja excluir este cliente?")) return;

    const novos = getClientes().filter(c => c.id !== id);

    localStorage.setItem("clientes", JSON.stringify(novos));

    renderClientes(novos);
}

// ======================
// VER
// ======================
function verCliente(id) {

    const cliente = getClientes().find(c => c.id === id);

    if (!cliente) return;

    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];

    const compras = vendas.filter(v =>
        v.cliente &&
        (
            v.cliente.cpf === cliente.cpf ||
            v.cliente.nome === cliente.nome
        )
    );

    let totalGasto = compras.reduce((soma, v) => soma + v.total, 0);

    document.getElementById("modalTitulo").textContent =
        `Cliente: ${cliente.nome}`;

    const conteudo = document.getElementById("modalConteudo");

    conteudo.innerHTML = `
        <p><strong>Telefone:</strong> ${cliente.telefone}</p>
        <p><strong>Email:</strong> ${cliente.email}</p>
        <p><strong>Cidade:</strong> ${cliente.cidade}</p>
        <p><strong>Status:</strong> ${cliente.status}</p>

        <hr>

        <h3>💰 Compras</h3>
        <p>Total de compras: ${compras.length}</p>
        <p>Total gasto: R$ ${totalGasto.toFixed(2)}</p>

        <hr>

        <h3>📦 Histórico</h3>

        ${
            compras.length
            ? compras.map(v => `
                <div style="padding:10px; border-bottom:1px solid #eee">
                    <p><strong>#${v.id}</strong></p>
                    <p>${v.data}</p>
                    <p>R$ ${v.total.toFixed(2)}</p>
                </div>
            `).join("")
            : "<p>Nenhuma compra encontrada</p>"
        }
    `;

    document.getElementById("modalCliente").style.display = "flex";
}

function fecharModalCliente() {
    document.getElementById("modalCliente").style.display = "none";
}

// ======================
// EDITAR (PRONTO PRA EVOLUIR)
// ======================
function editarCliente(id) {

    const cliente = getClientes().find(c => c.id === id);

    if (!cliente) return;

    localStorage.setItem("clienteEditando", JSON.stringify(cliente));

    window.location.href = "novoCliente/novoCliente.html";
}