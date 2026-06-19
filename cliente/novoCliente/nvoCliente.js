// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", carregarEdicao);

// ======================
// GET CLIENTES
// ======================
function getClientes() {
    return JSON.parse(localStorage.getItem("clientes")) || [];
}

// ======================
// SALVAR CLIENTE
// ======================
function salvarCliente(event) {

    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const status = document.getElementById("status").value;

// remove tudo que não for número
const numeros = telefone.replace(/\D/g, "");

// valida quantidade EXATA
if (numeros.length !== 10 && numeros.length !== 11) {
    alert("Telefone inválido! Digite DDD + número completo.");
    return;
}

    if (!nome || !telefone) {
        alert("Nome e telefone são obrigatórios!");
        return;
    }

    let clientes = getClientes();

    const cliente = {
        id: window.clienteEditandoId || Date.now(),
        nome,
        telefone,
        email,
        cidade,
        status,
        novo: true,
        dataCadastro: new Date().toLocaleString("pt-BR")
    };

    if (window.clienteEditandoId) {

        clientes = clientes.map(c =>
            c.id === window.clienteEditandoId ? cliente : c
        );

    } else {
        clientes.push(cliente);
    }

    localStorage.setItem("clientes", JSON.stringify(clientes));

    localStorage.removeItem("clienteEditando");

    window.clienteEditandoId = null;

    alert("Cliente salvo com sucesso!");

    window.location.href = "../clientes.html";
    
}

const telefoneInput = document.getElementById("telefone");

if (telefoneInput) {
    telefoneInput.addEventListener("input", (e) => {
        let value = e.target.value;

        // remove tudo que não for número
        value = value.replace(/\D/g, "");

        // aplica máscara
        if (value.length <= 2) {
            value = value.replace(/(\d{0,2})/, "($1");
        } 
        else if (value.length <= 7) {
            value = value.replace(/(\d{2})(\d+)/, "($1) $2");
        } 
        else {
            value = value.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
        }

        e.target.value = value;
    });
}

// ======================
// EDITAR
// ======================
function carregarEdicao() {

    const dados = localStorage.getItem("clienteEditando");

    if (!dados) return;

    const cliente = JSON.parse(dados);

    document.getElementById("nome").value = cliente.nome || "";
    document.getElementById("telefone").value = cliente.telefone || "";
    document.getElementById("email").value = cliente.email || "";
    document.getElementById("cidade").value = cliente.cidade || "";
    document.getElementById("status").value = cliente.status || "Ativo";

    window.clienteEditandoId = cliente.id;
}