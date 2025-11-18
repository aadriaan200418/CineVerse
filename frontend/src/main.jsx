// Importamos React, la librería principal para construir interfaces de usuario
import React from "react";

// Importamos ReactDOM, que permite renderizar componentes de React dentro del DOM del navegador
import ReactDOM from "react-dom/client";

// Importamos el componente principal de la aplicación (App.jsx)
import App from "./App";

// ReactDOM.createRoot() crea el punto de entrada donde React “inyecta” la aplicación en el HTML.
// document.getElementById("root") hace referencia al <div id="root"></div> del index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  // React.StrictMode activa comprobaciones adicionales durante el desarrollo.
  // Ayuda a detectar posibles errores o malas prácticas, aunque no afecta en producción.
  <React.StrictMode>
    {/* Se renderiza el componente principal de la aplicación */}
    <App />
  </React.StrictMode>
);
