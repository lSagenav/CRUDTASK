const API_URL = "http://localhost:3000/tasks";
const tasksContainer = document.getElementById("tasksContainer");
const loggedUser = JSON.parse(localStorage.getItem("user"));
let taskModal; 

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Verificar sesión
    if (!loggedUser) {
        window.location.href = "login.html";
        return;
    }
    
    // Mostrar nombre del usuario
    document.getElementById("userNameDisplay").textContent = `Hola, ${loggedUser.name}`;
    
    // Inicializar el Modal de Bootstrap
    const modalEl = document.getElementById('taskModal');
    if(modalEl) {
        taskModal = new bootstrap.Modal(modalEl);
    }

    // Cargar tareas iniciales
    loadTasks();
});

// ==========================================
// 2. ABRIR MODAL (CREAR)
// ==========================================
// Esta función faltaba y por eso el botón "Nueva Tarea" no hacía nada
window.openCreateModal = function() {
    const form = document.getElementById("taskForm");
    if(form) form.reset(); // Limpiar formulario
    
    document.getElementById("taskId").value = ""; // Limpiar ID (importante para saber que es nueva)
    document.getElementById("modalTitle").textContent = "Nueva Tarea";
    
    if(taskModal) taskModal.show();
}

// ==========================================
// 3. CARGAR TAREAS (LEER)
// ==========================================
async function loadTasks(filterStatus = "All") {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();

        // Filtrar solo las tareas de este usuario
        let myTasks = tasks.filter(task => task.userId === loggedUser.id);

        // Aplicar filtro de estado si es necesario
        if (filterStatus !== "All") {
            myTasks = myTasks.filter(task => task.status === filterStatus);
        }

        renderTasks(myTasks);
    } catch (error) {
        console.error("Error cargando tareas:", error);
    }
}

// ==========================================
// 4. PINTAR TAREAS EN HTML
// ==========================================
function renderTasks(tasks) {
    const container = document.getElementById("tasksContainer");
    const template = document.getElementById("task-row-template");
    container.innerHTML = ""; // Limpiar tabla

    if (tasks.length === 0) {
        // Mostrar mensaje de vacío si no hay tareas
        const emptyMsg = document.getElementById("emptyMessage");
        if(emptyMsg) emptyMsg.classList.remove("d-none");
        return;
    } else {
        const emptyMsg = document.getElementById("emptyMessage");
        if(emptyMsg) emptyMsg.classList.add("d-none");
    }

    tasks.forEach(task => {
        const clone = template.content.cloneNode(true);
        
        // Llenar datos básicos
        clone.querySelector(".task-title").textContent = task.title;
        clone.querySelector(".task-desc").textContent = task.description;
        clone.querySelector(".task-date").textContent = task.dueDate;
        
        // Badges con colores
        const badgeP = clone.querySelector(".task-priority");
        badgeP.textContent = task.priority;
        badgeP.className = `badge task-priority ${getPriorityColor(task.priority)}`;

        const badgeS = clone.querySelector(".task-status");
        badgeS.textContent = task.status;
        badgeS.className = `badge task-status ${getStatusColor(task.status)}`;

        // BOTONES DE ACCIÓN
        // 1. Borrar
        clone.querySelector(".btn-delete").onclick = () => deleteTask(task.id);
        
        // 2. Editar (ESTO FALTABA) -> Ahora llama a loadTaskIntoModal
        const btnEdit = clone.querySelector(".btn-edit");
        btnEdit.onclick = () => loadTaskIntoModal(task);

        container.appendChild(clone);
    });
}

// ==========================================
// 5. PREPARAR EDICIÓN
// ==========================================
function loadTaskIntoModal(task) {
    // Llenar el formulario con los datos de la tarea
    document.getElementById("taskId").value = task.id; // ¡Clave para editar!
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDesc").value = task.description;
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskDate").value = task.dueDate;
    document.getElementById("taskStatus").value = task.status;

    // Cambiar título del modal
    document.getElementById("modalTitle").textContent = "Editar Tarea";
    
    // Mostrar modal
    taskModal.show();
}

// ==========================================
// 6. GUARDAR (CREAR O EDITAR)
// ==========================================
async function saveTask() {
    // Obtener valores del formulario
    const id = document.getElementById("taskId").value; // Si tiene valor, es EDICIÓN
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDesc").value;
    const priority = document.getElementById("taskPriority").value;
    const date = document.getElementById("taskDate").value;
    const status = document.getElementById("taskStatus").value;

    // Validación simple
    if (!title || !date) {
        return Swal.fire("Atención", "El título y la fecha son obligatorios", "warning");
    }

    // Objeto Tarea
    const taskData = {
        userId: loggedUser.id, // Vincular al usuario actual
        title: title,
        description: description,
        dueDate: date,
        priority: priority,
        status: status
    };

    try {
        if (id) {
            // === MODO EDICIÓN (PUT) ===
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            });
            Swal.fire("Actualizado", "La tarea ha sido modificada", "success");
        } else {
            // === MODO CREACIÓN (POST) ===
            // Generamos ID manual string para evitar conflictos
            taskData.id = Date.now().toString(); 
            
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            });
            Swal.fire("Guardado", "Nueva tarea creada exitosamente", "success");
        }

        taskModal.hide(); // Cerrar modal
        loadTasks();      // Recargar lista

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudo guardar la tarea", "error");
    }
}

// ==========================================
// 7. BORRAR
// ==========================================
async function deleteTask(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, borrar'
    });

    if (result.isConfirmed) {
        try {
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            Swal.fire('¡Borrado!', 'La tarea ha sido eliminada.', 'success');
            loadTasks();
        } catch (error) {
            Swal.fire("Error", "No se pudo borrar", "error");
        }
    }
}

// ==========================================
// 8. UTILIDADES
// ==========================================
function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

function getPriorityColor(p) {
    if (p === "High") return "bg-danger";
    if (p === "Medium") return "bg-warning text-dark";
    return "bg-success";
}

function getStatusColor(s) {
    if (s === "Completed") return "bg-success";
    if (s === "In Progress") return "bg-primary";
    return "bg-secondary";
}

// Función global para los filtros del sidebar
window.filterTasks = function(status) {
    loadTasks(status);
}