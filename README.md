# CRUDTASK
# CRUDTASK: Academic Task Management Application

CRUDTASK is a web application designed for the efficient management of academic tasks, allowing users to manage their own activities and administrators to monitor overall system activity.

This project was developed as part of a Module 3 performance test, using pure front-end technologies and simulating data persistence through a mock API with `JSON Server` and `LocalStorage`.

---

## 🚀 Implemented Features

Based on the project requirements, the following list of key features has been successfully completed:

### Authentication and Security Module
* **User Registration:** Creation of new accounts with automatic assignment of the `user` role.

* **Login:** Credential validation against `JSON Server` and session persistence using `LocalStorage`.

* **Role Control:** Automatic redirection to `index.html` (user) or `dashboard.html` (admin) after logging in, and path protection.

### User and Task Module
* **Task Creation:** Users can add new tasks to their personal list.

* **Task Editing:** Functionality to modify details of existing tasks.

* **Status Management:** Ability to change the status of tasks (`pending`, `in progress`, `completed`).

### Administrative Module
* **User Management (Optional):** The administrator panel includes a section to view and, optionally, manage registered users.

* **General Dashboard:** Consolidated view of all system tasks.

---

## 🛠️ Technologies Used

The project was built following the mandatory specifications, focusing on simplicity and client-side performance:

* **HTML5 & CSS3:** Basic structure and styles.

* **Bootstrap 5:** CSS framework for responsive design and UI components.

* **Vanilla JavaScript:** Application logic, event handling, and API consumption.

* **JSON Server:** Tool to simulate a complete REST API with a local `db.json` file.

* **LocalStorage:** Used to maintain the user session after authentication.

---

## 💻 Running the Project (Locally)

To run this project in your local environment, follow these steps:

### Prerequisites
You need to have **Node.js** and **npm** installed globally.

### Run the backend project
json-server --watch db/db.json

### frontend
live server in Visual Studio Code