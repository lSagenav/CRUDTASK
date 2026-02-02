// Configuration: API Endpoint for authentication and user storage
const Api_Users = "http://localhost:3000/users";

/**
 * UI Toggle: Switches the view from Login form to Register form
 */
function showRegister() {
    const loginDiv = document.getElementById("loginForm");
    const regDiv = document.getElementById("registerForm");
    if(loginDiv && regDiv) {
        loginDiv.classList.add("d-none"); // Hide login
        regDiv.classList.remove("d-none"); // Show registration
    }
}

/**
 * UI Toggle: Switches the view from Register form back to Login form
 */
function showLogin() {
    const loginDiv = document.getElementById("loginForm");
    const regDiv = document.getElementById("registerForm");
    if(loginDiv && regDiv) {
        regDiv.classList.add("d-none"); // Hide registration
        loginDiv.classList.remove("d-none"); // Show login
    }
}

/**
 * Login Logic: Authenticates user credentials and manages role-based redirection
 */
async function loginUser() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    // Input validation
    if (!email || !password) {
        return Swal.fire("Error", "Please fill in all fields", "warning");
    }

    try {
        // 1. Fetch user by email query parameter
        const response = await fetch(`${Api_Users}?email=${email}`);
        const users = await response.json();

        // 2. Credential verification (Check existence and password match)
        if (users.length === 0 || users[0].password !== password) {
            return Swal.fire("Error", "Invalid email or password", "error");
        }

        const user = users[0];

        // 3. Persistent session: Save user object in LocalStorage
        localStorage.setItem("user", JSON.stringify(user));

        // 4. Role-Based Navigation: Determines destination page based on 'admin' vs 'user' role
        Swal.fire({
            icon: 'success',
            title: `Welcome, ${user.name}`,
            showConfirmButton: false,
            timer: 1000
        }).then(() => {
            if (user.role === "admin") {
                window.location.href = "dashboard.html"; // Admin panel
            } else {
                window.location.href = "index.html";     // Regular user dashboard
            }
        });

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Connection to db.json failed", "error");
    }
}

/**
 * Registration Logic: Creates a new user profile with default "user" role
 */
async function registerUser() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) return Swal.fire("Error", "Empty fields", "warning");

    try {
        // 1. Availability check: Ensure the email is not already registered
        const check = await fetch(`${Api_Users}?email=${email}`);
        const existing = await check.json();

        if (existing.length > 0) return Swal.fire("Error", "Email already registered", "error");

        // 2. Object construction: Force default role to "user" for security
        const newUser = {
            id: Date.now().toString(), // Unique ID generation
            name: name,
            email: email,
            password: password,
            role: "user"
        };

        // 3. Post request: Save the new user record to the API
        await fetch(Api_Users, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newUser)
        });

        Swal.fire("Success", "Account created. Please log in.", "success");
        showLogin();

    } catch (error) {
        console.error("Registration error:", error);
    }
}
