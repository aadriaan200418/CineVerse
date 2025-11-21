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

import CreateAdmin from "./pages/Create-admin";
import Settings from "./pages/Settings";
import DetailSerie from "./pages/DetailSerie";   // 👈 nombre consistente
import DetailMovie from "./pages/DetailMovie";   // 👈 para películas

// Importamos el componente de ruta protegida
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/home" element={<Home />} />
        <Route path="/settings" element={<Settings />} />

        {/* Vistas separadas para series y películas */}
        <Route path="/series" element={<Home view="series" />} />
        <Route path="/movies" element={<Home view="movies" />} />
        <Route path="/likes" element={<Home view="likes" />} />
        <Route path="/favorites" element={<Home view="favorites" />} />

        {/* Detalles */}
        <Route path="/series/:id" element={<DetailSerie />} />
        <Route path="/movies/:id" element={<DetailMovie />} />

        {/* Ruta protegida solo para admin */}
        <Route
          path="/create-admin"
          element={
            <ProtectedRoute>
              <CreateAdmin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
