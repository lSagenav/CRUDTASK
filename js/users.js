const API_URL_USERS = "http://localhost:3000/users";
const usersTableBody = document.getElementById("usersTableBody");

document.addEventListener("DOMContentLoaded", () => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    
    // Seguridad: Redirigir si no es admin
    if (!loggedUser || loggedUser.role !== 'admin') {
        window.location.href = "login.html";
        return;
    }
    
    loadUsers();
});

async function loadUsers() {
    try {
        const response = await fetch(API_URL_USERS);
        if (!response.ok) throw new Error("Error al obtener usuarios");
        
        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        console.error("Error:", error);
        // Opcional: mostrar un mensaje de error en la tabla
        usersTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">No se pudo conectar con el servidor</td></tr>`;
    }
}

function renderUsers(users) {
    const template = document.getElementById("user-row-template");
    if (!usersTableBody || !template) return;
    
    usersTableBody.innerHTML = ""; 

    users.forEach(user => {
        const clone = template.content.cloneNode(true);

        clone.querySelector(".user-id").textContent = user.id;
        clone.querySelector(".user-name").textContent = user.name;
        clone.querySelector(".user-email").textContent = user.email;

        const roleBadge = clone.querySelector(".user-role .badge");
        roleBadge.textContent = user.role;
        
        // Limpiar clases previas y añadir la nueva
        roleBadge.classList.add(user.role === 'admin' ? 'bg-danger' : 'bg-primary');
        
        usersTableBody.appendChild(clone);
    });
}
