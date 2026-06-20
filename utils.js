//Scripts JS geral
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarNumero(valor) {
    return Number(valor).toLocaleString("pt-BR");
}

function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
}

// MENU MOBILE

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("ativo");

        if (sidebar.classList.contains("ativo")) {
            menuToggle.textContent = "✖";
        } else {
            menuToggle.textContent = "☰";
        }
    });
}