import { useCallback, useState } from "react";
import Login from "./components/login";
import KanbanBoard from "./components/KanbanBoard";
import Signup from "./components/Signup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  // return <KanbanBoard />;
  // return <Login />;
  // return <Signup />;
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/kanban"
          element={
            <PrivateRoute>
              <KanbanBoard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
