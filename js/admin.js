const API_URL_TASKS = "http://localhost:3000/tasks"; // Sin _expand aquí
const API_URL_USERS = "http://localhost:3000/users"; // URL para usuarios
const API_BASE = "http://localhost:3000/tasks"; // URL base para PUT/DELETE
let adminModal;
let allUsers = []; // Variable global para almacenar todos los usuarios

// 1. SEGURIDAD
const loggedUser = JSON.parse(localStorage.getItem("user"));
if (!loggedUser || loggedUser.role !== 'admin') {
    window.location.href = "login.html";
}

// 2. INICIO
document.addEventListener("DOMContentLoaded", async () => {
    // Inicializar el modal de Bootstrap
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
        adminModal = new bootstrap.Modal(modalElement);
    }
    
    // Primero carga todos los usuarios disponibles
    await loadAllUsers();

    if(document.getElementById("adminTableBody")) {
        loadAdminData(); // Luego carga las tareas
    }
});

// NUEVA FUNCIÓN: Cargar todos los usuarios
async function loadAllUsers() {
    try {
        const response = await fetch(API_URL_USERS);
        allUsers = await response.json();
    } catch (error) {
        console.error("Error cargando usuarios:", error);
    }
}

// 3. CARGAR DATOS (FUNCIÓN MODIFICADA para filtrar y hacer match manual)
async function loadAdminData(filterStatus = "All") {
    try {
        let fetchUrl = API_URL_TASKS; 

        if (filterStatus !== "All") {
            // Aquí usamos '?' porque API_URL_TASKS no tiene ningún parámetro aún
            fetchUrl = `${API_URL_TASKS}?status=${filterStatus}`;
        }
        
        const response = await fetch(fetchUrl);
        let tasks = await response.json();

        // **AQUÍ HACEMOS EL MATCH MANUAL (JOIN)**
        // Iteramos sobre las tareas y adjuntamos el objeto de usuario correspondiente
        tasks = tasks.map(task => {
            const user = allUsers.find(u => u.id === task.userId);
            // Creamos una nueva propiedad 'user' en cada objeto task manualmente
            return { ...task, user: user || null }; 
        });

        updateStats(tasks);
        renderAdminTable(tasks);
    } catch (error) {
        console.error("Error:", error);
    }
}

// 4. PINTAR TABLA (Con botón editar)
function renderAdminTable(tasks) {
    const tbody = document.getElementById("adminTableBody");
    const template = document.getElementById("admin-row-template");
    // Asegúrate de que el template existe en el HTML antes de usarlo
    if (!template) {
        console.error("Template 'admin-row-template' no encontrado!");
        return;
    }
    tbody.innerHTML = "";

    if (tasks.length === 0) {
        // Opcional: mostrar un mensaje de "No hay tareas" si lo tienes implementado
        return;
    }

    tasks.forEach(task => {
        const clone = template.content.cloneNode(true);
        
        // Datos básicos
        clone.querySelector(".t-id").textContent = task.id;
        
        // --- CORRECCIÓN DE USUARIO ---
        const userName = task.user ? task.user.name : "Usuario Borrado o Desconocido";
        const userEmail = task.user ? task.user.email : `ID: ${task.userId}`;
        
        clone.querySelector(".t-user").textContent = userName;
        clone.querySelector(".t-email").textContent = userEmail;
        
        clone.querySelector(".t-title").textContent = task.title;
        clone.querySelector(".t-date").textContent = task.dueDate;
        
        // Estado con color
        const badge = clone.querySelector(".t-status");
        badge.textContent = task.status;
        badge.className = `badge t-status ${getStatusClass(task.status)}`;

        // --- BOTONES ---
        // 1. Editar
        const btnEdit = clone.querySelector(".btn-edit");
        btnEdit.onclick = () => openEditModal(task);

        // 2. Borrar
        const btnDelete = clone.querySelector(".btn-delete");
        btnDelete.onclick = () => deleteAsAdmin(task.id);

        tbody.appendChild(clone);
    });
}

// 5. ABRIR MODAL DE EDICIÓN
function openEditModal(task) {
    document.getElementById("editTaskId").value = task.id;
    document.getElementById("editTitle").value = task.title;
    document.getElementById("editDate").value = task.dueDate;
    document.getElementById("editStatus").value = task.status;
    
    adminModal.show();
}

// 6. GUARDAR CAMBIOS (PUT)
async function saveAdminTask() {
    const id = document.getElementById("editTaskId").value;
    const title = document.getElementById("editTitle").value;
    const date = document.getElementById("editDate").value;
    const status = document.getElementById("editStatus").value;

    if (!id || !title || !date) {
        Swal.fire("Atención", "Faltan datos en el formulario.", "warning");
        return;
    }

    try {
        // Primero obtenemos la tarea original para no perder el userId ni la descripción
        const originalResponse = await fetch(`${API_BASE}/${id}`);
        const originalTask = await originalResponse.json();

        const updatedTask = {
            ...originalTask, // Mantiene userId, priority, description, etc.
            title: title,
            dueDate: date,
            status: status
        };

        await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask)
        });

        adminModal.hide();
        Swal.fire("Actualizado", "La tarea ha sido modificada", "success");
        loadAdminData(); // Recargar la vista actual

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudo actualizar", "error");
    }
}

// 7. BORRAR
async function deleteAsAdmin(id) {
    if(confirm("¿Estás seguro de eliminar esta tarea permanentemente?")) {
        try {
            await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
            loadAdminData(); // Recargar tabla
        } catch (error) {
            Swal.fire("Error", "No se pudo borrar", "error");
        }
    }
}

// 8. ESTADÍSTICAS & UTILS
function updateStats(tasks) {
    if (!Array.isArray(tasks)) return;
    
    document.getElementById("totalCount").textContent = tasks.length;
    document.getElementById("pendingCount").textContent = tasks.filter(t => t.status === "Pending" || t.status === "In Progress").length;
    document.getElementById("completedCount").textContent = tasks.filter(t => t.status === "Completed").length;
}

function getStatusClass(status) {
    if (status === "Completed") return "bg-success";
    if (status === "In Progress") return "bg-primary";
    return "bg-warning text-dark"; // Pending
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// --- FUNCIÓN GLOBAL PARA LOS FILTROS DEL SIDEBAR ---
window.filterAdminTasks = function(status) {
    loadAdminData(status);
}