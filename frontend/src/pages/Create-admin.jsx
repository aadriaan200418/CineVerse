// Importamos React y useState para manejar el estado del formulario
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Importamos los estilos CSS
import "../css/create-admin.css";

// Componente principal de la página de create-admin
export default function AddContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const form = searchParams.get("form");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    releaseDate: "",
    genre: "",
    minAge: "",
    type: "",
    duration: "",
    actors: "",
    seasons: "",
    episodes: ""
  });

  // Estado de errores por campo
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    image: "",
    releaseDate: "",
    genre: "",
    minAge: "",
    type: "",
    duration: "",
    actors: "",
    seasons: "",
    episodes: ""
  });

  // Validadores por campo
  const validators = {
    title: (v) => {
      if (!v.trim()) return "El título es obligatorio.";
      if (v.trim().length < 2) return "Debe tener al menos 2 caracteres.";
      return "";
    },
    description: (v) => {
      if (!v.trim()) return "La descripción es obligatoria.";
      if (v.length < 10) return "Debe tener al menos 10 caracteres.";
      return "";
    },
    image: (v) => {
      if (!v.trim()) return "La imagen es obligatoria.";
      if (!/^[a-zA-Z0-9]+\.(jpg|jpeg|png|gif)$/i.test(v)) {
        return "Debe ser un formato válido de imagen (jpg, png, gif).";
      }
      return "";
    },
    releaseDate: (v) => {
      if (!v) return "La fecha de estreno es obligatoria.";
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return "Fecha no válida.";
      return "";
    },
    genre: (v) => {
      if (!v.trim()) return "El género es obligatorio.";
      return "";
    },
    minAge: (v) => {
      if (!v) return "La edad mínima es obligatoria.";
      if (parseInt(v) < 0) return "Debe ser un número positivo.";
      return "";
    },
    type: (v) => {
      if (!v) return "Debe seleccionar película o serie.";
      return "";
    },
    duration: (v) => {
      if (formData.type === "pelicula") {
        if (!v) return "La duración es obligatoria.";
        if (parseInt(v) <= 0) return "Debe ser mayor que 0.";
      }
      return "";
    },
    actors: (v) => {
      if (!v.trim()) return "Debe indicar al menos un actor.";
      return "";
    },
    seasons: (v) => {
      if (formData.type === "serie") {
        if (!v) return "El número de temporadas es obligatorio.";
        if (parseInt(v) <= 0) return "Debe ser mayor que 0.";
      }
      return "";
    },
    episodes: (v) => {
      if (formData.type === "serie") {
        if (!v) return "El número de capítulos es obligatorio.";
        if (parseInt(v) <= 0) return "Debe ser mayor que 0.";
      }
      return "";
    }
  };

  // Manejo de cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const error = validators[name] ? validators[name](value) : "";
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Validar todos los campos antes de enviar
  const validateAll = () => {
    const newErrors = Object.keys(formData).reduce((acc, key) => {
      acc[key] = validators[key] ? validators[key](formData[key]) : "";
      return acc;
    }, {});
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    try {
      const res = await fetch("http://localhost:3001/api/add-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.errors) {
        setErrors((prev) => ({ ...prev, ...data.errors }));
        return;
      }

      if (data.success) {
        alert("Contenido guardado correctamente");
        navigate("/home");
      } else {
        alert("Error: " + (data.error || "Error al guardar contenido"));
      }
    }
    catch {
      alert("Error de conexión con el servidor");
    }
  };

  // Renderizado del formulario
  return (
    <div className="add-container">
      <button className="back-button" onClick={() => navigate("/home")}>←</button>

      {form === "users-admin" && (
        <>
          <h1 className="add-title">Añadir Usuario / Administrador</h1>

          <form className="add-form" onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}

            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className="field-error">{errors.username}</div>}

            <input
              type="text"
              name="dni"
              placeholder="DNI"
              value={formData.dni}
              onChange={handleChange}
            />
            {errors.dni && <div className="field-error">{errors.dni}</div>}

            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
            />
            {errors.birth_date && <div className="field-error">{errors.birth_date}</div>}

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="field-error">{errors.email}</div>}

            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="field-error">{errors.password}</div>}

            <div className="role-selector">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === "user"}
                  onChange={handleChange}
                />
                Usuario
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === "admin"}
                  onChange={handleChange}
                />
                Administrador
              </label>
            </div>
            {errors.role && <div className="field-error">{errors.role}</div>}

            <button type="submit" className="continue-btn">Guardar</button>
          </form>

        </>
      )}

      {form === "users-admin" && (
        <>
          <h1 className="add-title">Añadir Serie/Película</h1>

          <form className="add-form" onSubmit={handleSubmit} noValidate>
            <input type="text" name="title" placeholder="Nombre de serie/película" value={formData.title} onChange={handleChange} />
            {errors.title && <div className="field-error">{errors.title}</div>}

            <textarea name="description" placeholder="Descripción" value={formData.description} onChange={handleChange} />
            {errors.description && <div className="field-error">{errors.description}</div>}

            <input type="text" name="image" placeholder="Imagen" value={formData.image} onChange={handleChange} />
            {errors.image && <div className="field-error">{errors.image}</div>}

            <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} />
            {errors.releaseDate && <div className="field-error">{errors.releaseDate}</div>}

            <input type="text" name="genre" placeholder="Género" value={formData.genre} onChange={handleChange} />
            {errors.genre && <div className="field-error">{errors.genre}</div>}

            <input type="number" name="minAge" placeholder="Edad mínima" value={formData.minAge} onChange={handleChange} />
            {errors.minAge && <div className="field-error">{errors.minAge}</div>}

            <div className="type-selector">
              <label>
                <input type="radio" name="type" value="pelicula" checked={formData.type === "pelicula"} onChange={handleChange} />
                Película
              </label>
              <label>
                <input type="radio" name="type" value="serie" checked={formData.type === "serie"} onChange={handleChange} />
                Serie
              </label>
            </div>
            {errors.type && <div className="field-error">{errors.type}</div>}

            {formData.type === "pelicula" && (
              <>
                <input type="number" name="duration" placeholder="Duración en minutos" value={formData.duration} onChange={handleChange} />
                {errors.duration && <div className="field-error">{errors.duration}</div>}

                <input type="text" name="actors" placeholder="Actores (actor1 , actor2)" value={formData.actors} onChange={handleChange} />
                {errors.actors && <div className="field-error">{errors.actors}</div>}
              </>
            )}

            {formData.type === "serie" && (
              <>
                <input type="number" name="seasons" placeholder="Número de temporadas" value={formData.seasons} onChange={handleChange} />
                {errors.seasons && <div className="field-error">{errors.seasons}</div>}

                <input type="number" name="episodes" placeholder="Número de capítulos" value={formData.episodes} onChange={handleChange} />
                {errors.episodes && <div className="field-error">{errors.episodes}</div>}

                <input type="text" name="actors" placeholder="Actores" value={formData.actors} onChange={handleChange} />
                {errors.actors && <div className="field-error">{errors.actors}</div>}
              </>
            )}

            <button type="submit" className="continue-btn">Guardar</button>
          </form>
        </>
      )}
    </div>
  );
}
