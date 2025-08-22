document.addEventListener("DOMContentLoaded", function() {
    // Existing form functionality
    const form = document.getElementById("registrationForm");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            
            let username = document.getElementById("username").value.trim();
            let email = document.getElementById("email").value.trim();
            let password = document.getElementById("password").value.trim();
            let message = "";

            // Validation
            if (!username) {
                message = "O nome de usuário é obrigatório.";
            } else if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
                message = "Email inválido.";
            } else if (!password || password.length < 6) {
                message = "A senha deve ter pelo menos 6 caracteres.";
            }

            if (message) {
                alert(message);
                return;
            }

            // Save user data
            let user = {
                username: username,
                email: email
            };

            let users = JSON.parse(localStorage.getItem("users") || "[]");
            users.push(user);
            localStorage.setItem("users", JSON.stringify(users));

            alert("Usuário registrado com sucesso!");
            form.reset();
        });
    }

    // New user button functionality
    const usuarioBtn = document.getElementById('usuario-btn');
    if (usuarioBtn) {
        usuarioBtn.onclick = function() {
            alert('Botão Usuário clicado!');
        };
    }
});