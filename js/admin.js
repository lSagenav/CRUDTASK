const API_URL_TASKS = "http://localhost:3000/tasks"; 
const API_URL_USERS = "http://localhost:3000/users"; 
const API_BASE = "http://localhost:3000/tasks"; 
let adminModal;
let allUsers = []; // Global variable to store user data for manual joining

// 1. SECURITY & ACCESS CONTROL
const loggedUser = JSON.parse(localStorage.getItem("user"));
if (!loggedUser || loggedUser.role !== 'admin') {
    window.location.href = "login.html";
}

// 2. INITIALIZATION
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize Bootstrap Modal instance
    const modalElement = document.getElementById('editModal');
    if (modalElement) {
        adminModal = new bootstrap.Modal(modalElement);
    }
    
    // Fetch users first to enable task-user mapping
    await loadAllUsers();

    if(document.getElementById("adminTableBody")) {
        loadAdminData(); // Load tasks once users are available
    }
});

// FETCH UTILITY: Retrieve all users from database
async function loadAllUsers() {
    try {
        const response = await fetch(API_URL_USERS);
        allUsers = await response.json();
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// 3. DATA LOADING (Handles filtering and manual JSON join)
async function loadAdminData(filterStatus = "All") {
    try {
        let fetchUrl = API_URL_TASKS; 

        if (filterStatus !== "All") {
            fetchUrl = `${API_URL_TASKS}?status=${filterStatus}`;
        }
        
        const response = await fetch(fetchUrl);
        let tasks = await response.json();

        // MANUAL JOIN: Map tasks to their corresponding user objects
        tasks = tasks.map(task => {
            const user = allUsers.find(u => u.id === task.userId);
            return { ...task, user: user || null }; 
        });

        updateStats(tasks);
        renderAdminTable(tasks);
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

// 4. TABLE RENDERING
function renderAdminTable(tasks) {
    const tbody = document.getElementById("adminTableBody");
    const template = document.getElementById("admin-row-template");

    if (!template) {
        console.error("Template 'admin-row-template' not found!");
        return;
    }
    
    tbody.innerHTML = "";

    if (tasks.length === 0) {
        // Optional: Implement "No tasks found" UI state here
        return;
    }

    tasks.forEach(task => {
        const clone = template.content.cloneNode(true);
        
        // Basic task info
        clone.querySelector(".t-id").textContent = task.id;
        
        // USER DATA MAPPING: Handle deleted or missing user references
        const userName = task.user ? task.user.name : "Unknown/Deleted User";
        const userEmail = task.user ? task.user.email : `User ID: ${task.userId}`;
        
        clone.querySelector(".t-user").textContent = userName;
        clone.querySelector(".t-email").textContent = userEmail;
        
        clone.querySelector(".t-title").textContent = task.title;
        clone.querySelector(".t-date").textContent = task.dueDate;
        
        // Status Badge Styling
        const badge = clone.querySelector(".t-status");
        badge.textContent = task.status;
        badge.className = `badge t-status ${getStatusClass(task.status)}`;

        // ACTION BUTTONS: Event listeners
        // 1. Edit Action
        const btnEdit = clone.querySelector(".btn-edit");
        btnEdit.onclick = () => openEditModal(task);

        // 2. Delete Action
        const btnDelete = clone.querySelector(".btn-delete");
        btnDelete.onclick = () => deleteAsAdmin(task.id);

        tbody.appendChild(clone);
    });
}

// 5. MODAL MANAGEMENT: Populate edit form
function openEditModal(task) {
    document.getElementById("editTaskId").value = task.id;
    document.getElementById("editTitle").value = task.title;
    document.getElementById("editDate").value = task.dueDate;
    document.getElementById("editStatus").value = task.status;
    
    adminModal.show();
}

// 6. UPDATE DATA (PUT Method)
async function saveAdminTask() {
    const id = document.getElementById("editTaskId").value;
    const title = document.getElementById("editTitle").value;
    const date = document.getElementById("editDate").value;
    const status = document.getElementById("editStatus").value;

    if (!id || !title || !date) {
        Swal.fire("Warning", "Please fill in all required fields.", "warning");
        return;
    }

    try {
        // Fetch original task to preserve immutable fields (like userId or description)
        const originalResponse = await fetch(`${API_BASE}/${id}`);
        const originalTask = await originalResponse.json();

        const updatedTask = {
            ...originalTask, 
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
        Swal.fire("Updated", "The task has been modified successfully", "success");
        loadAdminData(); // Refresh current view

    } catch (error) {
        console.error("Update error:", error);
        Swal.fire("Error", "Could not update the task", "error");
    }
}

// 7. DELETE DATA
async function deleteAsAdmin(id) {
    // Using native confirm for brevity, can be replaced with SweetAlert
    if(confirm("Are you sure you want to permanently delete this task?")) {
        try {
            await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
            loadAdminData(); // Refresh UI
        } catch (error) {
            Swal.fire("Error", "The task could not be deleted", "error");
        }
    }
}

// 8. DASHBOARD STATISTICS & HELPERS
function updateStats(tasks) {
    if (!Array.isArray(tasks)) return;
    
    document.getElementById("totalCount").textContent = tasks.length;
    document.getElementById("pendingCount").textContent = tasks.filter(t => t.status === "Pending" || t.status === "In Progress").length;
    document.getElementById("completedCount").textContent = tasks.filter(t => t.status === "Completed").length;
}

// Return Bootstrap class based on status string
function getStatusClass(status) {
    if (status === "Completed") return "bg-success";
    if (status === "In Progress") return "bg-primary";
    return "bg-warning text-dark"; // Default: Pending
}

// AUTH: Session termination
function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// GLOBAL FILTER EXPOSURE: Accessible from sidebar links
window.filterAdminTasks = function(status) {
    loadAdminData(status);
}
