import { sendData, getData, deleteUser, editUser, updateUser } from "./controller/crudUser";

const routes = {
    "/": "/src/views/home.html", // Página de inicio (accesible a todos)
    "/login": "/src/views/auth/login.html", // Página de login (accesible a todos)
    "/register": "/src/views/auth/register.html", // Página de registro (accesible a todos)
    "/users": "/src/views/users/index.html", // Protegida: Gestión de usuarios
    "/dashboard": "/src/views/dashboard.html", // Protegida: Dashboard principal
    "/dashboard/events/create": "/src/views/dashboard/events/create.html", // Protegida: Crear evento
    "/dashboard/events/edit": "/src/views/dashboard/events/edit.html", // Protegida: Editar evento
    "/not-found": "/src/views/not-found.html" // Página 404 personalizada (accesible a todos)
};

// Rutas que requieren autenticación
const protectedRoutes = [
    "/users",
    "/dashboard",
    "/dashboard/events/create",
    "/dashboard/events/edit"
];

const users = await getData(); // Carga inicial de usuarios

export async function renderRoute() {
    const path = location.pathname;
    const app = document.getElementById('app');

    let loggedInUser = localStorage.getItem('loggedInUser')? JSON.parse(localStorage.getItem('loggedInUser')) : null;
    let userRole = loggedInUser? loggedInUser.role : null;

    // --- Lógica de Protección de Rutas (Guardián) ---

    // 7b. Si el usuario ya está autenticado e intenta acceder a /login o /register,
    // redirigir al dashboard.
    if (loggedInUser && (path === "/login" |

 path === "/register")) {
        window.location.href = '/dashboard';
        return;
    }

    // 7a. Si el usuario no está autenticado e intenta acceder a una ruta protegida,
    // o si la ruta no existe, redirigir a /not-found.
    const file = routes[path];
    if (!file |

    (protectedRoutes.includes(path) &&!loggedInUser)) {
        window.location.href = '/not-found';
        return;
    }

    // --- Fin Lógica de Protección de Rutas ---

    try {
        const res = await fetch(file);
        const html = await res.text();
        app.innerHTML = html;

        // --- Lógica Condicional basada en la ruta y autenticación ---

        if (path === "/login") {
            const btnLogin = document.getElementById('btn-login');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            if (btnLogin) {
                btnLogin.addEventListener('click', (e) => {
                    e.preventDefault();
                    const username = usernameInput.value;
                    const password = passwordInput.value;
                    const user = users.find(u => u.username === username && u.password === password);

                    if (user) {
                        // Guardar el nombre de usuario y el rol en localStorage como un objeto JSON
                        localStorage.setItem('loggedInUser', JSON.stringify({ username: user.username, role: user.role }));
                        window.location.href = '/dashboard'; // Redirige al dashboard después del login
                    } else {
                        console.warn('usuario no existe');
                        alert('Usuario o contraseña incorrectos.');
                    }
                });
            }
        } else if (path === "/register") {
            const btnRegister = document.getElementById("btnRegister");
            if (btnRegister) {
                btnRegister.addEventListener("click", () => {

                    const username = document.getElementById("username").value;
                    const password = document.getElementById("password").value;
                    const repeatPassword = document.getElementById("repeatPassword").value;

                    if (!username ||!password ||!repeatPassword) {
                        alert("Todos los campos son requeridos");
                        return;
                    }

                    if (password!== repeatPassword) {
                        alert('Contraseñas no coinciden');
                        return;
                    }

                    const form = {
                        username: username,
                        password: password,
                        created: new Date().toISOString(),
                        role: "user" // Rol por defecto para nuevos registros
                    };
                    sendData(form);
                });
            }
        } else if (path === "/users") { // Esta es una ruta protegida
            const userTableBody = document.querySelector('#userTable tbody');
            if (userTableBody) {
                userTableBody.innerHTML = ''; // Limpiar tabla antes de añadir filas
                users.forEach(u => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${u.id}</td>
                        <td>${u.username}</td>
                        <td>${u.password}</td>
                        <td>${u.created}</td>
                        <td>
                            <button data-id="${u.id}" class="edit-btn">Editar</button>
                            <button data-id="${u.id}" class="delete-btn">Eliminar</button>
                        </td>
                    `;

                    const deleteButton = row.querySelector('.delete-btn');
                    const editButton = row.querySelector('.edit-btn');

                    // Control de visibilidad de botones según el rol del usuario
                    if (userRole === 'admin') { // Solo admin puede editar/eliminar usuarios
                        if (deleteButton) {
                            deleteButton.addEventListener('click', () => {
                                deleteUser(u.id);
                            });
                        }
                        if (editButton) {
                            editButton.addEventListener('click', () => {
                                editUser(u.id);
                                console.log(`Editar usuario con ID: ${u.id}`);
                            });
                        }
                    } else { // Si no es admin, ocultar estos botones
                        if (deleteButton) deleteButton.style.display = 'none';
                        if (editButton) editButton.style.display = 'none';
                    }

                    userTableBody.appendChild(row);
                });
            }

            const btnSendEdit = document.getElementById('btnSendEdit');
            // Mostrar el botón de actualizar solo si es admin
            if (btnSendEdit && userRole === 'admin') {
                btnSendEdit.addEventListener('click', () => {
                    updateUser();
                });
            } else if (btnSendEdit) {
                btnSendEdit.style.display = 'none'; // Ocultar si no es admin
            }

        } else if (path === "/dashboard") { // Lógica para la vista del Dashboard
            const welcomeMessage = document.getElementById('welcomeMessage');
            if (welcomeMessage && loggedInUser) {
                welcomeMessage.textContent = `Bienvenido, ${loggedInUser.username}! Tu rol es: ${loggedInUser.role}`;
            }

            // Mostrar/ocultar enlaces de administración en el dashboard
            const adminLinks = document.getElementById('adminLinks');
            if (adminLinks) {
                if (userRole === 'admin') {
                    adminLinks.style.display = 'block'; // Mostrar para admins
                } else {
                    adminLinks.style.display = 'none'; // Ocultar para no-admins
                }
            }
        } else if (path === "/dashboard/events/create") {
            // Lógica específica para la página de creación de eventos (solo admins)
            // Aquí iría la lógica para el formulario de creación de eventos
        } else if (path === "/dashboard/events/edit") {
            // Lógica específica para la página de edición/eliminación de eventos (solo admins)
            // Aquí iría la lógica para listar y gestionar eventos
        }
        // No se necesita lógica específica para /home.html o /not-found.html más allá de cargarlos.

    } catch (error) {
        console.warn('Error al cargar la ruta: ', error);
        // En caso de error al cargar el archivo, redirigir a not-found
        window.location.href = '/not-found';
    }
}