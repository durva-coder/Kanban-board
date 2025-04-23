# Kanban Board Application

## Project Overview

This project is a Kanban board application with a backend API and a React frontend. The backend is built with Node.js, Express, and MongoDB, providing RESTful API endpoints for user authentication, board management, columns, and tasks. The frontend is a React application built with Vite, providing a user interface to interact with the Kanban board.

---

## Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following environment variables:

   ```
   JWT_SECRET=your_jwt_secret_key
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Start the backend server (development mode with nodemon):
   ```bash
   npm start
   ```

The backend server will start on the default port (usually 3000 or as configured).

---

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. To build the frontend for production:

   ```bash
   npm run build
   ```

5. To preview the production build locally:
   ```bash
   npm run preview
   ```

---

## API Documentation

### Authentication

- **POST /signup**  
  Register a new user.  
  Request body: `{ name, email, password }`  
  Response: Success message, JWT token, and user info.

- **POST /login**  
  Login an existing user.  
  Request body: `{ email, password }`  
  Response: Success message, JWT token, and user info.

- **GET /is-authenticated**  
  Check if the user is authenticated.  
  Requires Authorization header with Bearer token.  
  Response: Authentication status and user info.

### Board

- **GET /**  
  Get the authenticated user's board with columns and tasks.  
  Response: Board object with nested columns and tasks.

- **PUT /**  
  Update the board's name and description.  
  Request body: `{ name, description }`  
  Response: Success message and updated board.

- **DELETE /**  
  Delete the user's board along with all columns and tasks.  
  Response: Success message.

### Column

- **POST /**  
  Add a new column to the board.  
  Request body: `{ title }`  
  Response: Success message and created column.

- **PUT /:columnId**  
  Update a column's title and order.  
  Request body: `{ title, order }`  
  Response: Success message and updated column.

- **DELETE /:columnId**  
  Delete a column and all its tasks.  
  Response: Success message.

- **PUT /reorder**  
  Reorder columns by updating their order.  
  Request body: `{ columns: [{ _id, order }, ...] }`  
  Response: Success message.

### Task

- **POST /**  
  Add a new task to a column.  
  Request body: `{ title, description, columnId }`  
  Response: Success message and created task.

- **PUT /:taskId**  
  Update a task's details and optionally move it to another column.  
  Request body: `{ title, description, columnId }`  
  Response: Success message and updated task.

- **DELETE /:taskId**  
  Delete a task.  
  Response: Success message.

- **PUT /reorder**  
  Reorder tasks by updating their order and column.  
  Request body: `{ tasks: [{ _id, order, columnId }, ...] }`  
  Response: Success message.

---

## Deployment

The application is deployed at:  
[Insert your deployment link here]

---

Please replace the deployment link above with the actual URL once deployed.
