import axios from "axios";

let currentEditId = null;
const usersUrl = "http://localhost:3001/users";

export async function getData() {
    try {
        const resp = await axios.get(usersUrl);
        const data = resp.data;

        return data.sort(function (a, b) {
            return new Date(b.created) - new Date(a.created);
        });

    } catch (error) {
        console.log(error);
        return "Algo salió mal";
    }
}

export async function sendData(formData) {
    try {
        await axios.post(usersUrl, formData);
        alert('Usuario creado exitosamente!')
        
        // window.location.href = '/users'
    } catch (error) {
        console.log(error);
        return "ocurrió un error";
    }
}

// Función para establecer el ID del usuario que se está editando
function setEditId(id) {
    currentEditId = id;
}

// Función para limpiar el ID cuando ya no se edita
function clearEditId() {
    currentEditId = null;
}

export async function deleteUser(id) {
    const confirmed = confirm(
        "¿Estás seguro de que quieres eliminar este usuario?"
    );
    if (!confirmed) return;
    try {
        await axios.delete(`${usersUrl}/${id}`);
        alert("Usuario eliminado con éxito");
        location.reload(); 
    } catch (error) {
        console.log(error);
        alert("Error al eliminar Usuario");
    }
}

export async function editUser(id) {
    try {
        const resp = await axios.get(usersUrl);
        const dataResponse = resp.data;
        const data = dataResponse.find(e => e.id == id)

        // Rellenar el campo de username en el formulario
        document.getElementById("username").value = data.username;
        document.getElementById("password").value = '';
        document.getElementById("repeatPassword").value = '';
        document.getElementById("created").value = data.created;


        // Actualizar el texto de edición si lo tienes
        const textEdit = document.getElementById("edit-text");
        if (textEdit) { // Asegúrate de que el elemento exista
            textEdit.hidden = false;
            textEdit.textContent = `Editando a ${data.username}`; // Solo muestra el username
        }

        // Guarda el ID del usuario que se está editando
        setEditId(id);

    } catch (error) {
        console.error('Error al obtener usuario para editar:', error); // Usa console.error para errores
        alert("Error al obtener el usuario para editar.");
    }
}

export async function updateUser() {

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const repeatPasswordInput = document.getElementById('repeatPassword');
    const createdInput = document.getElementById('created');

    const username = usernameInput.value;
    const password = passwordInput.value;
    const repeatPassword = repeatPasswordInput.value;
    const created = createdInput.value;

    // Solo validar y enviar la contraseña si se ha ingresado algo en los campos
    let passwordToUpdate = null;
    if (password || repeatPassword) { // Si al menos uno de los campos de contraseña tiene valor
        if (password !== repeatPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }
        passwordToUpdate = password;
    }

    // Cargar los datos actuales del usuario para no sobrescribir el password si no se cambió
    try {
        const resp = await axios.get(`${usersUrl}/${currentEditId}`);
        const existingUser = resp.data;

        // Crear el objeto con los datos a enviar
        const updatedData = {
            username: username,
            // Solo actualiza la contraseña si se proporcionó una nueva
            password: passwordToUpdate !== null ? passwordToUpdate : existingUser.password,
            // No necesitas repeatPassword en el objeto a enviar a la API
            created: created
        };

        await axios.put(`${usersUrl}/${currentEditId}`, updatedData);
        alert("Usuario actualizado con éxito.");

        // Limpiar el formulario y el estado de edición
        usernameInput.value = '';
        passwordInput.value = '';
        repeatPasswordInput.value = '';
        createdInput.value = '';

        clearEditId(); // Limpiar el ID de edición
        location.reload(); // Recargar la página para ver los cambios actualizados

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        alert("Error al actualizar el usuario.");
    }
}