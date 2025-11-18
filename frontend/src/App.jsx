// Importamos React, necesario para poder usar JSX en este archivo
import React from "react";

// Importamos los componentes necesarios de React Router DOM para manejar las rutas
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importamos las páginas que se mostrarán en las rutas
import Index from "./pages/Index";              // Página principal
import Register from "./pages/Register";        // Página de registro
import Login from "./pages/Login";              // Página de inicio de sesión
import Profiles from "./pages/Profiles";        // Página de perfiles

// Aquí definimos la estructura de navegación de la app
export default function App() {
  return (
    // BrowserRouter permite que React Router controle la navegación mediante URLs
    <BrowserRouter>
      {/* Routes agrupa todas las rutas disponibles en la aplicación */}
      <Routes>
        <Route path="/" element={<Index />}/> {/* Ruta página de inicio */}

        <Route path="/register" element={<Register />}/> {/* Ruta pagina de registro */}

        <Route path="/login" element={<Login />}/>  {/* Ruta pagina de inicio de sesión */}
 
        <Route path="/profiles" element={<Profiles />}/> {/* Ruta pagina de perfiles*/}
      </Routes>
    </BrowserRouter>
  );
}
