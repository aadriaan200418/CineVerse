// Importamos React, necesario para poder usar JSX en este archivo
import React from "react";

// Importamos los componentes necesarios de React Router DOM para manejar las rutas
// - BrowserRouter: permite que la app use el historial del navegador (URLs reales)
// - Routes: agrupa todas las rutas de la aplicación
// - Route: define cada ruta y qué componente se renderiza en ella
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importamos las páginas que se mostrarán en las rutas
import Index from "./pages/Index"; // Página principal
import Register from "./pages/Register"; // Página de registro
import Login from "./pages/Login"; // Página de inicio de sesión

// Componente principal de la aplicación
// Aquí definimos la estructura de navegación de la app
export default function App() {
  return (
    // BrowserRouter permite que React Router controle la navegación mediante URLs
    <BrowserRouter>
      {/* Routes agrupa todas las rutas disponibles en la aplicación */}
      <Routes>

        {/* Ruta principal "/" que muestra la página de inicio */}
        <Route path="/" element={<Index />} />

        {/* Ruta "/register" que muestra el formulario de registro */}
        <Route path="/register" element={<Register />} />

        {/* Ruta "/login" que muestra el formulario de inicio de sesión */}
        <Route path="/login" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}
