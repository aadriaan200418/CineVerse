// Importamos React y hooks
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS
import "../css/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  // Función para manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos vacíos
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "El usuario es obligatorio";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        localStorage.setItem("token", data.token);
        localStorage.setItem("dni", data.id_profile);
        if (data.role === "admin") {
          navigate("/home");
        }
        else {
          navigate("/profiles");
        }
      }
      else if (data.error === "USER_NOT_FOUND") {
        alert("Usuario no encontrado, crea una cuenta");
        navigate("/register");
      }
      else {
        setErrors({ general: data.error || "Error al iniciar sesión" });
      }
    }
    catch {
      setErrors({ general: "Error de conexión con el servidor" });
    }
  };

  return (
    <div className="login-container">
      <button className="back-button" onClick={() => navigate("/")}>←</button>

      <h1 className="login-title">Iniciar sesión</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <input id="username" type="text" name="username" value={formData.username} onChange={handleChange} className="form-input" placeholder="nombre de usuario" />
        {errors.username && <span className="error">{errors.username}</span>}

        <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" placeholder="contraseña" />
        {errors.password && <span className="error">{errors.password}</span>}

        {errors.general && <div className="error">{errors.general}</div>}

        <button type="submit" className="login-continue-btn">Continuar</button>
      </form>
    </div>
  );
}
