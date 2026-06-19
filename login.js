// ======================
// ELEMENTOS
// ======================

const senha =
    document.getElementById(
        "senha"
    );

const toggleSenha =
    document.getElementById(
        "toggleSenha"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const btnLogin =
    document.getElementById(
        "btnLogin"
    );

const mensagem =
    document.getElementById(
        "mensagemLogin"
    );

// ======================
// MOSTRAR SENHA
// ======================

toggleSenha.addEventListener(
    "click",
    () => {

        if(
            senha.type ===
            "password"
        ){

            senha.type =
                "text";

            toggleSenha.textContent =
                "👁️‍🗨️";

        }else{

            senha.type =
                "password";

            toggleSenha.textContent =
                "👁️";

        }

    }
);

// ======================
// LOGIN
// ======================

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = document.querySelector("input[type='text']").value;
    const senhaValor = senha.value;

    mensagem.textContent = "";
    btnLogin.disabled = true;
    btnLogin.textContent = "⏳ Entrando...";

    setTimeout(() => {

        if (usuario === "samuelSoares" && senhaValor === "1234") {

            localStorage.setItem("logado", "true");
            localStorage.setItem("usuario", usuario);

            window.location.href = "./inicio/dashboard.html";

        } else {

            mensagem.textContent = "Usuário ou senha inválidos";

            btnLogin.disabled = false;
            btnLogin.textContent = "Entrar";
        }

    }, 1200);
});

