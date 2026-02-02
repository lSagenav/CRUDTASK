// URL única (porque ahora todos son "users")
const Api_Users = "http://localhost:3000/users";

// --- CAMBIO DE FORMULARIO (VISUAL) ---
function showRegister() {
    const loginDiv = document.getElementById("loginForm");
    const regDiv = document.getElementById("registerForm");
    if(loginDiv && regDiv) {
        loginDiv.classList.add("d-none");
        regDiv.classList.remove("d-none");
    }
}

function showLogin() {
    const loginDiv = document.getElementById("loginForm");
    const regDiv = document.getElementById("registerForm");
    if(loginDiv && regDiv) {
        regDiv.classList.add("d-none");
        loginDiv.classList.remove("d-none");
    }
}

// --- LOGIN (INICIAR SESIÓN) ---
async function loginUser() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        return Swal.fire("Error", "Llena todos los campos", "warning");
    }

    try {
        // 1. Buscamos al usuario por correo
        const response = await fetch(`${Api_Users}?email=${email}`);
        const users = await response.json();

        // 2. Si no existe o la contraseña está mal
        if (users.length === 0 || users[0].password !== password) {
            return Swal.fire("Error", "Correo o contraseña incorrectos", "error");
        }

        const user = users[0];

        // 3. Guardamos en LocalStorage
        localStorage.setItem("user", JSON.stringify(user));

        // 4. REDIRECCIÓN SEGÚN ROL (La clave del éxito)
        Swal.fire({
            icon: 'success',
            title: `Hola, ${user.name}`,
            showConfirmButton: false,
            timer: 1000
        }).then(() => {
            if (user.role === "admin") {
                window.location.href = "dashboard.html"; // Al Admin
            } else {
                window.location.href = "index.html";     // Al User
            }
        });

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se conecta con db.json", "error");
    }
}

// --- REGISTRO ---
async function registerUser() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) return Swal.fire("Error", "Campos vacíos", "warning");

    try {
        // Validar si ya existe
        const check = await fetch(`${Api_Users}?email=${email}`);
        const existing = await check.json();

        if (existing.length > 0) return Swal.fire("Error", "El correo ya existe", "error");

        // Crear usuario nuevo (siempre rol user)
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password,
            role: "user"
        };

        await fetch(Api_Users, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newUser)
        });

        Swal.fire("Éxito", "Cuenta creada. Inicia sesión.", "success");
        showLogin();

    } catch (error) {
        console.error(error);
    }
}