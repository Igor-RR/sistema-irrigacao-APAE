// Captura o elemento do formulário de login
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
    // Impede o recarregamento natural da página ao clicar no botão submit
    event.preventDefault(); 
    
    // Futuramente, pegaremos os dados assim para enviar ao FastAPI:
    // const username = document.getElementById('username').value;
    // const password = document.getElementById('password').value;
    
    // Lógica futura: 
    // const resposta = await fetch('/api/login', { ... })
    // if (resposta.ok) { window.location.href = "/"; }
    
    // Por enquanto (Mock de Login), redireciona direto para o painel principal
    console.log("Validando login...");
    window.location.href = "/";
});