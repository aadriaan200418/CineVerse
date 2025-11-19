// Importamos React
import React from "react";

// Importamos los componentes necesarios de React Router DOM
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importamos las páginas
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profiles from "./pages/Profiles";
import Home from "./pages/Home";
import AddContent from "./pages/Create-admin"; // ← nueva página

// Importamos el componente de ruta protegida
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/home" element={<Home />} />

        {/* Ruta protegida solo para admin */}
        <Route
          path="/Create-admin"
          element={
            <ProtectedRoute>
              <AddContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
