// Importamos React y hooks
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Importamos los estilos CSS
import "../css/create-admin.css";

export default function AddContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const form = searchParams.get("form");

  //Formulario de usuario/admin 
  const [formData2, setFormData2] = useState({ name: "", username: "", dni: "", birth_date: "", email: "", password: "", role: "",});
  const [errors2, setErrors2] = useState({ name: "", username: "", dni: "", birth_date: "", email: "", password: "", role: "",});

  //Formulario de serie/pelicula
  const [formData1, setFormData1] = useState({ title: "", description: "", image: "", releaseDate: "", genre: "", minAge: "", type: "", duration: "", actors: "", seasons: "", episodes: ""});
  const [errors1, setErrors1] = useState({ title: "", description: "", image: "", releaseDate: "", genre: "", minAge: "", type: "", duration: "", actors: "", seasons: "", episodes: ""});

  // Validadores por campo de series/peliculas
  const validators1 = {
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
      if (!/^[a-zA-Z0-9_]+[a-zA-Z0-9]?\.(jpg|jpeg|png|gif)$/i.test(v)) {
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
      if (formData1.type === "pelicula") {
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
      if (formData1.type === "serie") {
        if (!v) return "El número de temporadas es obligatorio.";
        if (parseInt(v) <= 0) return "Debe ser mayor que 0.";
      }
      return "";
    },
    episodes: (v) => {
      if (formData1.type1 === "serie") {
        if (!v) return "El número de capítulos es obligatorio.";
        if (parseInt(v) <= 0) return "Debe ser mayor que 0.";
      }
      return "";
    }
  };

  // Validadores por campo de user/admin
  const validators2 = {
    name: (v) => {
      if (!v.trim()) return "El nombre completo es obligatorio.";
      if (v.length < 3) return "Debe tener al menos 3 caracteres.";
      return "";
    },
    username: (v) => {
      if (!v.trim()) return "El nombre de usuario es obligatorio.";
      if (v.length < 4) return "Debe tener al menos 4 caracteres.";
      return "";
    },
    dni: (v) => {
      if (!v.trim()) return "El DNI es obligatorio.";
      if (!/^\d{8}[A-Za-z]$/.test(v)) return "Debe tener 8 números y una letra.";
      return "";
    },
    birth_date: (v) => {
      if (!v.trim()) return "La fecha de nacimiento es obligatoria.";
      const date = new Date(v);
      if (isNaN(date.getTime())) return "Debe ser una fecha válida.";

      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const m = today.getMonth() - date.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--;
      }

      if (age < 18) return "Debe ser mayor de 18 años.";
      return "";
    },
    email: (v) => {
      if (!v.trim()) return "El correo electrónico es obligatorio.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Debe ser un correo válido.";
      return "";
    },
    password: (v) => {
      if (!v.trim()) return "La contraseña es obligatoria.";
      if (v.length < 6) return "Debe tener al menos 6 caracteres.";
      return "";
    },
    role: (v) => {
      if (!v.trim()) return "El rol es obligatorio.";
      if (!["user", "admin"].includes(v)) return "El rol debe ser 'Usuario' o 'Administrador'.";
      return "";
    },
  };

  // Manejo de cambios en inputs en series/peliculas
  const handleChange1 = (e) => {
    const { name, value } = e.target;
    setFormData1({ ...formData1, [name]: value });

    const error = validators1[name] ? validators1[name](value) : "";
    setErrors1((prev) => ({ ...prev, [name]: error }));
  };

  // Manejo de cambios en inputs en user/admin
  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setFormData2({ ...formData2, [name]: value });

    const error = validators2[name] ? validators2[name](value) : "";
    setErrors2((prev) => ({ ...prev, [name]: error }));
  };

  // Validar todos los campos antes de enviar en series/peliculas
  const validateAll1 = () => {
    const newErrors = Object.keys(formData1).reduce((acc, key) => {
      acc[key] = validators1[key] ? validators1[key](formData1[key]) : "";
      return acc;
    }, {});
    setErrors1(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  // Validar todos los campos antes de enviar en user/admin
  const validateAll2 = () => {
    const newErrors = Object.keys(formData2).reduce((acc, key) => {
      acc[key] = validators2[key] ? validators2[key](formData2[key]) : "";
      return acc;
    }, {});
    setErrors2(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  // Enviar formulario de movies-series
  const handleSubmit1 = async (e) => {
    e.preventDefault();
    if (!validateAll1()) return;
    try {
      const res = await fetch("http://localhost:3001/api/add-movie-serie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData1)
      });

      const data = await res.json();
      if (data.errors1) {
        setErrors((prev) => ({ ...prev, ...data.errors1 }));
        return;
      }
      if (data.success) {
        alert("Contenido guardado correctamente");
        navigate("/home");
      }
      else {
        alert("Error: " + (data.error || "Error al guardar contenido"));
      }
    }
    catch {
      alert("Error de conexión con el servidor");
    }
  };

  // Enviar formulario de user-admin
  const handleSubmit2 = async (e) => {
    e.preventDefault();
    if (!validateAll2()) return;
    try {
      const res = await fetch("http://localhost:3001/api/add-user-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData2)
      });

      const data = await res.json();
      if (data.errors2) {
        setErrors2((prev) => ({ ...prev, ...data.errors2 }));
        return;
      }
      if (data.success) {
        alert("Contenido guardado correctamente");
        navigate("/home");
      }
      else {
        alert("Error: " + (data.error || "Error al guardar contenido"));
      }
    }
    catch {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="add-container">
      <button className="back-button" onClick={() => navigate("/home")}>←</button>

      {/*Formulario de añadir peliculas y series */}
      {form === "movies-series" && (
        <>
          <h1 className="add-title">Añadir Serie/Película</h1>

          <form className="add-form" onSubmit={handleSubmit1} noValidate>
            <input type="text" name="title" placeholder="Nombre de serie/película" value={formData1.title} onChange={handleChange1} />
            {errors1.title && <div className="field-error">{errors1.title}</div>}

            <textarea name="description" placeholder="Descripción" value={formData1.description} onChange={handleChange1} />
            {errors1.description && <div className="field-error">{errors1.description}</div>}

            <input type="text" name="image" placeholder="Imagen" value={formData1.image} onChange={handleChange1} />
            {errors1.image && <div className="field-error">{errors1.image}</div>}

            <input type="date" name="releaseDate" value={formData1.releaseDate} onChange={handleChange1} />
            {errors1.releaseDate && <div className="field-error">{errors1.releaseDate}</div>}

            <input type="text" name="genre" placeholder="Género" value={formData1.genre} onChange={handleChange1} />
            {errors1.genre && <div className="field-error">{errors1.genre}</div>}

            <input type="number" name="minAge" placeholder="Edad mínima" value={formData1.minAge} onChange={handleChange1} />
            {errors1.minAge && <div className="field-error">{errors1.minAge}</div>}

            <div className="add-type-selector">
              <label>
                <input type="radio" name="type" value="pelicula" checked={formData1.type === "pelicula"} onChange={handleChange1} />
                Película
              </label>
              <label>
                <input type="radio" name="type" value="serie" checked={formData1.type === "serie"} onChange={handleChange1} />
                Serie
              </label>
            </div>
            {errors1.type && <div className="field-error">{errors1.type}</div>}

            {/* Si es pelicula */}
            {formData1.type === "pelicula" && (
              <>
                <input type="number" name="duration" placeholder="Duración en minutos" value={formData1.duration} onChange={handleChange1} />
                {errors1.duration && <div className="field-error">{errors1.duration}</div>}

                <input type="text" name="actors" placeholder="Actores (actor1 , actor2)" value={formData1.actors} onChange={handleChange1} />
                {errors1.actors && <div className="field-error">{errors1.actors}</div>}
              </>
            )}

            {/* Si es serie */}
            {formData1.type === "serie" && (
              <>
                <input type="number" name="seasons" placeholder="Número de temporadas" value={formData1.seasons} onChange={handleChange1} />
                {errors1.seasons && <div className="field-error">{errors1.seasons}</div>}

                <input type="number" name="episodes" placeholder="Número de capítulos" value={formData1.episodes} onChange={handleChange1} />
                {errors1.episodes && <div className="field-error">{errors1.episodes}</div>}

                <input type="text" name="actors" placeholder="Actores" value={formData1.actors} onChange={handleChange1} />
                {errors1.actors && <div className="field-error">{errors1.actors}</div>}
              </>
            )}

            <button type="submit" className="add-continue-btn">Guardar</button>
          </form>
        </>
      )}

      {/*Formulario de añadir peliculas y series */}
      {form === "users-admin" && (
        <>
          <h1 className="add-title">Añadir Usuario / Administrador</h1>

          <form className="add-form" onSubmit={handleSubmit2} noValidate>
            <input type="text" name="name" placeholder="Nombre completo" value={formData2.name} onChange={handleChange2} />
            {errors2.name && <div className="field-error">{errors2.name}</div>}

            <input type="text" name="username" placeholder="Nombre de usuario" value={formData2.username} onChange={handleChange2} />
            {errors2.username && <div className="field-error">{errors2.username}</div>}

            <input type="text" name="dni" placeholder="DNI" value={formData2.dni} onChange={handleChange2} />
            {errors2.dni && <div className="field-error">{errors2.dni}</div>}

            <input type="date" name="birth_date" value={formData2.birth_date} onChange={handleChange2} />
            {errors2.birth_date && <div className="field-error">{errors2.birth_date}</div>}

            <input type="email" name="email" placeholder="Correo electrónico" value={formData2.email} onChange={handleChange2} />
            {errors2.email && <div className="field-error">{errors2.email}</div>}

            <input type="password" name="password" placeholder="Contraseña" value={formData2.password} onChange={handleChange2} />
            {errors2.password && <div className="field-error">{errors2.password}</div>}

            <div className="add-type-selector">
              <label>
                <input type="radio" name="role" value="user" checked={formData2.role === "user"} onChange={handleChange2} />
                Usuario
              </label>

              <label>
                <input type="radio" name="role" value="admin" checked={formData2.role === "admin"} onChange={handleChange2} />
                Administrador
              </label>
            </div>
            {errors2.role && <div className="field-error">{errors2.role}</div>}

            <button type="submit" className="add-continue-btn">Guardar</button>
          </form>
        </>
      )}
    </div>
  );
}
