# CRUDTASK
# CRUDTASK: Aplicación de Gestión de Tareas Académicas

CRUDTASK es una aplicación web diseñada para la gestión eficiente de tareas académicas, permitiendo a los usuarios administrar sus propias actividades y a los administradores supervisar la actividad general del sistema.

Este proyecto fue desarrollado como parte de una prueba de desempeño del Módulo 3, utilizando tecnologías front-end puras y simulando la persistencia de datos mediante una API falsa con `JSON Server` y `LocalStorage`.

---

## 🚀 Funcionalidades Implementadas

Basado en los requerimientos del proyecto, se ha completado con éxito la siguiente lista de funcionalidades clave:

### Módulo de Autenticación y Seguridad
*   **Registro de Usuarios:** Creación de nuevas cuentas con asignación automática del rol `user`.
*   **Inicio de Sesión (Login):** Validación de credenciales contra `JSON Server` y persistencia de sesión mediante `LocalStorage`.
*   **Control de Roles:** Redirección automática a `index.html` (usuario) o `dashboard.html` (admin) tras iniciar sesión, y protección de rutas.

### Módulo de Usuario y Tareas
*   **Creación de Tareas:** Los usuarios pueden añadir nuevas tareas a su lista personal.
*   **Edición de Tareas:** Funcionalidad para modificar detalles de las tareas existentes.
*   **Gestión de Estados:** Capacidad de cambiar el estado de las tareas (`pending`, `in progress`, `completed`).

### Módulo Administrativo
*   **Gestión de Usuarios (Opcional):** El panel de administrador incluye una sección para visualizar y, opcionalmente, gestionar usuarios registrados.
*   **Dashboard General:** Vista consolidada de todas las tareas del sistema.

---

## 🛠️ Tecnologías Utilizadas

El proyecto fue construido siguiendo las especificaciones obligatorias, enfocándose en la simplicidad y el rendimiento del lado del cliente:

*   **HTML5 & CSS3:** Estructura y estilos base.
*   **Bootstrap 5:** Framework CSS para un diseño responsivo y componentes UI.
*   **JavaScript (Vanilla):** Lógica de la aplicación, manejo de eventos y consumo de API.
*   **JSON Server:** Herramienta para simular una API REST completa con un archivo `db.json` local.
*   **LocalStorage:** Usado para mantener la sesión del usuario activa tras la autenticación.

---

## 💻 Ejecución del Proyecto (Localmente)

Para ejecutar este proyecto en tu entorno local, sigue estos pasos:

### Prerrequisitos
Necesitas tener **Node.js** y **npm** instalados globalmente.

### Ejecutar el proyecto backend
json-server --watch db/db.json

### fronted
live server en visual studio code