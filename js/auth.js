const user = JSON.parse(localStorage.getItem("user"));
const page = window.location.pathname.split("/").pop();

if (page === "login.html") {
    if (user) {
        if (user.role === "admin") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "index.html";
        }
    }
}

if (page === "index.html") {
    if (!user) {
        window.location.href = "login.html";
    }
}

if (page === "dashboard.html") {
    if (!user || user.role !== "admin") {
        window.location.href = "login.html";
    }
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    window.location.href = "login.html";
}
