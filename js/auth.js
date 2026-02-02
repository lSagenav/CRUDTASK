/**
 * AUTHENTICATION & REDIRECT LOGIC
 * Handles session validation and route protection based on user roles.
 */

const user = JSON.parse(localStorage.getItem("user"));
const page = window.location.pathname.split("/").pop();

// 1. LOGIN PAGE PROTECTION
// If user is already logged in, redirect them away from the login page
if (page === "login.html") {
    if (user) {
        // Redirect based on role: admins to dashboard, regular users to index
        if (user.role === "admin") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "index.html";
        }
    }
}

// 2. USER AREA PROTECTION (index.html)
// Redirect to login if an unauthenticated user tries to access the main app
if (page === "index.html") {
    if (!user) {
        window.location.href = "login.html";
    }
}

// 3. ADMIN PANEL PROTECTION (dashboard.html)
// Restrict access to admin users only; redirect others to login
if (page === "dashboard.html") {
    if (!user || user.role !== "admin") {
        window.location.href = "login.html";
    }
}

/**
 * SESSION TERMINATION
 * Clears local storage data and redirects to the login screen.
 */
function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("cart"); // Optional: clear shopping cart if applicable
    window.location.href = "login.html";
}
