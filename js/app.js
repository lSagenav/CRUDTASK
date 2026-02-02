/**
 * Configuration and Global Variables
 * API_URL: Endpoint for task management
 * loggedUser: Retreives the session object from local storage
 */
const API_URL = "http://localhost:3000/tasks";
const tasksContainer = document.getElementById("tasksContainer");
const loggedUser = JSON.parse(localStorage.getItem("user"));
let taskModal; 

// ==========================================
// 1. INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Session Security Check: Redirect to login if no user is found
    if (!loggedUser) {
        window.location.href = "login.html";
        return;
    }
    
    // UI Personalization: Display current user's name
    document.getElementById("userNameDisplay").textContent = `Hola, ${loggedUser.name}`;
    
    // Bootstrap Modal Initialization for programmatic control (show/hide)
    const modalEl = document.getElementById('taskModal');
    if(modalEl) {
        taskModal = new bootstrap.Modal(modalEl);
    }

    // Initial data fetch
    loadTasks();
});

// ==========================================
// 2. MODAL CONTROL (CREATE MODE)
// ==========================================
/**
 * Resets the form and prepares the modal for a new task entry.
 * Attached to the window object to be accessible from the HTML sidebar/header.
 */
window.openCreateModal = function() {
    const form = document.getElementById("taskForm");
    if(form) form.reset(); 
    
    // Clear hidden ID field to ensure the system treats this as a new entry
    document.getElementById("taskId").value = ""; 
    document.getElementById("modalTitle").textContent = "Nueva Tarea";
    
    if(taskModal) taskModal.show();
}

// ==========================================
// 3. DATA FETCHING (READ)
// ==========================================
/**
 * Fetches tasks from the API and applies ownership and status filters.
 * @param {string} filterStatus - Default is "All", can be "Pending", "Completed", etc.
 */
async function loadTasks(filterStatus = "All") {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();

        // Security/Privacy: Filter tasks belonging only to the logged-in user
        let myTasks = tasks.filter(task => task.userId === loggedUser.id);

        // Apply secondary filtering based on the sidebar selection
        if (filterStatus !== "All") {
            myTasks = myTasks.filter(task => task.status === filterStatus);
        }

        renderTasks(myTasks);
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

// ==========================================
// 4. UI RENDERING
// ==========================================
/**
 * Dynamically injects tasks into the table body using HTML templates.
 */
function renderTasks(tasks) {
    const container = document.getElementById("tasksContainer");
    const template = document.getElementById("task-row-template");
    container.innerHTML = ""; 

    // Handle Empty States: Show/Hide empty inbox message
    if (tasks.length === 0) {
        const emptyMsg = document.getElementById("emptyMessage");
        if(emptyMsg) emptyMsg.classList.remove("d-none");
        return;
    } else {
        const emptyMsg = document.getElementById("emptyMessage");
        if(emptyMsg) emptyMsg.classList.add("d-none");
    }

    tasks.forEach(task => {
        const clone = template.content.cloneNode(true);
        
        // Data Mapping
        clone.querySelector(".task-title").textContent = task.title;
        clone.querySelector(".task-desc").textContent = task.description;
        clone.querySelector(".task-date").textContent = task.dueDate;
        
        // Priority Badges: Assign dynamic Bootstrap classes
        const badgeP = clone.querySelector(".task-priority");
        badgeP.textContent = task.priority;
        badgeP.className = `badge task-priority ${getPriorityColor(task.priority)}`;

        // Status Badges: Assign dynamic Bootstrap classes
        const badgeS = clone.querySelector(".task-status");
        badgeS.textContent = task.status;
        badgeS.className = `badge task-status ${getStatusColor(task.status)}`;

        // Event Listeners for Row Actions
        clone.querySelector(".btn-delete").onclick = () => deleteTask(task.id);
        
        const btnEdit = clone.querySelector(".btn-edit");
        btnEdit.onclick = () => loadTaskIntoModal(task);

        container.appendChild(clone);
    });
}

// ==========================================
// 5. UPDATE PREPARATION
// ==========================================
/**
 * Populates the modal form with existing task data for editing.
 */
function loadTaskIntoModal(task) {
    document.getElementById("taskId").value = task.id; // Critical for PUT request identification
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDesc").value = task.description;
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskDate").value = task.dueDate;
    document.getElementById("taskStatus").value = task.status;

    document.getElementById("modalTitle").textContent = "Editar Tarea";
    taskModal.show();
}

// ==========================================
// 6. FORM SUBMISSION (CREATE OR UPDATE)
// ==========================================
async function saveTask() {
    // Extract form data
    const id = document.getElementById("taskId").value; 
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDesc").value;
    const priority = document.getElementById("taskPriority").value;
    const date = document.getElementById("taskDate").value;
    const status = document.getElementById("taskStatus").value;

    // Basic Validation
    if (!title || !date) {
        return Swal.fire("Atención", "Title and date are required", "warning");
    }

    // Build Task Object
    const taskData = {
        userId: loggedUser.id, 
        title: title,
        description: description,
        dueDate: date,
        priority: priority,
        status: status
    };

    try {
        if (id) {
            // EDIT MODE: Uses PUT to update existing record
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            });
            Swal.fire("Updated", "Task modified successfully", "success");
        } else {
            // CREATE MODE: Uses POST to save new record
            taskData.id = Date.now().toString(); 
            
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            });
            Swal.fire("Saved", "New task created", "success");
        }

        taskModal.hide(); // Close UI
        loadTasks();      // Refresh Table

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Could not save the task", "error");
    }
}

// ==========================================
// 7. DELETION
// ==========================================
/**
 * Deletes a task from the server after user confirmation.
 */
async function deleteTask(id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This action cannot be undone",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
        try {
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            Swal.fire('Deleted!', 'Task has been removed.', 'success');
            loadTasks();
        } catch (error) {
            Swal.fire("Error", "Deletion failed", "error");
        }
    }
}

// ==========================================
// 8. HELPER UTILITIES
// ==========================================
/**
 * Clears local session and redirects to login.
 */
function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

/**
 * Priority styling logic for Bootstrap badges.
 */
function getPriorityColor(p) {
    if (p === "High") return "bg-danger";
    if (p === "Medium") return "bg-warning text-dark";
    return "bg-success";
}

/**
 * Status styling logic for Bootstrap badges.
 */
function getStatusColor(s) {
    if (s === "Completed") return "bg-success";
    if (s === "In Progress") return "bg-primary";
    return "bg-secondary";
}

/**
 * Global function for sidebar status filtering.
 */
window.filterTasks = function(status) {
    loadTasks(status);
}
