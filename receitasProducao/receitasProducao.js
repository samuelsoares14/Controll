// ======================
// ELEMENTOS
// ======================
const receitasGrid = document.getElementById("receitasGrid");
const buscarReceita = document.getElementById("buscarReceita");

// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", () => {
    carregarEdicao();
    renderizarReceitas(obterReceitas());
});

// ======================
// GET RECEITAS
// ======================
function obterReceitas() {
    return JSON.parse(localStorage.getItem("receitas")) || [];
}

// ======================
// RENDER
// ======================
function renderizarReceitas(lista) {

    if (!receitasGrid) return;

    receitasGrid.innerHTML = "";

    if (!lista || lista.length === 0) {
        receitasGrid.innerHTML = `
            <div class="sem-receitas">
                <h2>Nenhuma receita cadastrada</h2>
                <p>Clique em "Nova Receita" para começar.</p>
            </div>
        `;
        return;
    }

    receitasGrid.innerHTML = lista.map(r => `
        <div class="receita-card">

            <img
                src="${r.foto || 'https://via.placeholder.com/400x250'}"
                alt="${r.nome}"
            >

            <div class="receita-info">

                <h3>🍰 ${r.nome}</h3>

                <div class="info-item">
                    <strong>Categoria</strong>
                    <span>${r.categoria || "-"}</span>
                </div>

                <div class="info-item">
                    <strong>Ingredientes</strong>
                    <span>${r.ingredientes?.length || 0}</span>
                </div>

                <div class="precos">

                    <div class="preco-custo">
                        <strong>Custo</strong>
                        <span>R$ ${Number(r.custo || 0).toFixed(2)}</span>
                    </div>

                    <div class="preco-venda">
                        <strong>Venda</strong>
                        <span>R$ ${Number(r.precoVenda || 0).toFixed(2)}</span>
                    </div>

                </div>

            </div>

            <div class="acoes">

                <button class="editar" onclick="editarReceita(${r.id})">
                    ✏️ Editar
                </button>

                <button class="produzir" onclick="produzirReceita(${r.id})">
                    Produzir
                </button>

                <button class="excluir" onclick="excluirReceita(${r.id})">
                    🗑️ Excluir
                </button>

            </div>

        </div>
    `).join("");
}

// ======================
// BUSCA
// ======================
if (buscarReceita) {
    buscarReceita.addEventListener("input", () => {

        const texto = buscarReceita.value.toLowerCase();

        const filtradas = obterReceitas().filter(r =>
            r.nome.toLowerCase().includes(texto)
        );

        renderizarReceitas(filtradas);
    });
}

// ======================
// AÇÕES
// ======================
function excluirReceita(id) {

    if (!confirm("Deseja excluir esta receita?")) return;

    const novas = obterReceitas().filter(r => r.id !== id);

    localStorage.setItem("receitas", JSON.stringify(novas));

    renderizarReceitas(novas);
}

function editarReceita(id) {

    const receita = obterReceitas().find(r => r.id === id);

    if (!receita) {
        alert("Receita não encontrada!");
        return;
    }

    localStorage.setItem("receitaEditando", JSON.stringify(receita));

    window.location.href = "novaReceita/novaReceita.html?edit=1";
}

// ======================
// CARREGAR EDIÇÃO
// ======================
function carregarEdicao() {

    const dados = localStorage.getItem("receitaEditando");
    if (!dados) return;

    const receita = JSON.parse(dados);

    console.log("EDITANDO RECEITA:", receita);

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || "";
    };

    set("nomeReceita", receita.nome);
    set("categoriaReceita", receita.categoria);
    set("unidadeProducao", receita.unidade || "UN");
    set("custoReceita", receita.custo);
    set("precoVenda", receita.precoVenda);

    // imagem (preview)
    if (receita.foto) {
        const img = document.getElementById("previewImagem");
        if (img) {
            img.src = receita.foto;
            img.style.display = "block";
        }
    }

    if (typeof renderizarIngredientes === "function") {
        renderizarIngredientes(receita.ingredientes || []);
    }

    window.receitaEditandoId = receita.id;
}

// ======================
// SALVAR RECEITA
// ======================
function salvarReceita() {

    let receitas = obterReceitas();

    const receita = {
        id: window.receitaEditandoId || Date.now(),
        nome: document.getElementById("nome").value,
        categoria: document.getElementById("categoria").value,
        custo: parseFloat(document.getElementById("custo").value) || 0,
        precoVenda: parseFloat(document.getElementById("precoVenda").value) || 0,
        foto: document.getElementById("foto").value,
        ingredientes: typeof obterIngredientesDoForm === "function"
            ? obterIngredientesDoForm()
            : []
    };

    if (window.receitaEditandoId) {

        receitas = receitas.map(r =>
            r.id === window.receitaEditandoId ? receita : r
        );

    } else {
        receitas.push(receita);
    }

    localStorage.setItem("receitas", JSON.stringify(receitas));

    localStorage.removeItem("receitaEditando");

    window.receitaEditandoId = null;

    alert("Receita salva com sucesso!");
}

// ======================
// PRODUZIR RECEITA
// ======================
function produzirReceita(id) {

    const receita = obterReceitas().find(r => r.id === id);
    if (!receita) return;

    const quantidadeProduzir = parseFloat(prompt("Quantas receitas deseja produzir?"));

    if (!quantidadeProduzir || quantidadeProduzir <= 0) {
        alert("Quantidade inválida.");
        return;
    }

    let estoque = JSON.parse(localStorage.getItem("estoque")) || [];

    // VERIFICAR ESTOQUE
    for (const ingrediente of (receita.ingredientes || [])) {

        const produto = estoque.find(p =>
            p.nome.toLowerCase() === ingrediente.nome.toLowerCase()
        );

        if (!produto) {
            alert(`Ingrediente "${ingrediente.nome}" não encontrado no estoque.`);
            return;
        }

        let necessario = ingrediente.quantidade * quantidadeProduzir;

        if (produto.unidade === "KG" && ingrediente.unidade === "g") {
            necessario /= 1000;
        }

        if (produto.unidade === "L" && ingrediente.unidade === "ml") {
            necessario /= 1000;
        }

        if (produto.quantidade < necessario) {
            alert(`Estoque insuficiente para ${ingrediente.nome}`);
            return;
        }
    }

    // BAIXA ESTOQUE
    for (const ingrediente of (receita.ingredientes || [])) {

        const produto = estoque.find(p =>
            p.nome.toLowerCase() === ingrediente.nome.toLowerCase()
        );

        let necessario = ingrediente.quantidade * quantidadeProduzir;

        if (produto.unidade === "KG" && ingrediente.unidade === "g") {
            necessario /= 1000;
        }

        if (produto.unidade === "L" && ingrediente.unidade === "ml") {
            necessario /= 1000;
        }

        produto.quantidade -= necessario;
    }

    // PRODUTO FINAL
    let produtoFinal = estoque.find(p =>
        p.nome.toLowerCase() === receita.nome.toLowerCase()
    );

    if (produtoFinal) {
        produtoFinal.quantidade += quantidadeProduzir;
    } else {
        estoque.push({
            id: Date.now(),
            nome: receita.nome,
            categoria: receita.categoria,
            precoCusto: Number(receita.custo),
            precoVenda: Number(receita.precoVenda),
            quantidade: quantidadeProduzir,
            unidade: "UN",
            imagem: receita.foto,
            dataCadastro: new Date().toLocaleString("pt-BR")
        });
    }

    localStorage.setItem("estoque", JSON.stringify(estoque));

    // HISTÓRICO
    const historico = JSON.parse(localStorage.getItem("historicoProducao")) || [];

    historico.push({
        id: Date.now(),
        receita: receita.nome,
        quantidade: quantidadeProduzir,
        data: new Date().toLocaleString("pt-BR")
    });

    localStorage.setItem("historicoProducao", JSON.stringify(historico));

    alert("Produção realizada com sucesso!");
}