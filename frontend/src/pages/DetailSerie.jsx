// Importamos React y useState para manejar el estado del formulario
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Importamos los estilos CSS, iconos y componentes
import "../css/detail.css";
import like from "../assets/icons/like.png";
import likeFilled from "../assets/icons/like-filled.png";
import star from "../assets/icons/star.png";
import starFilled from "../assets/icons/star-filled.png";
import pen from "../assets/icons/pen.png";
import Loading from "../components/Loading";

// Componente principal de la página de detalle de serie
export default function DetailSerie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serie, setSerie] = useState(null);
  const [originalSerie, setOriginalSerie] = useState(null); // 👈 para restaurar al cancelar
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Validadores adaptados a tus campos reales
  const validators = {
    title: (v) => {
      if (!v?.trim()) return "El título es obligatorio.";
      if (v.trim().length < 2) return "Debe tener al menos 2 caracteres.";
      return "";
    },
    description: (v) => {
      if (!v?.trim()) return "La descripción es obligatoria.";
      if (v.trim().length < 10) return "Debe tener al menos 10 caracteres.";
      return "";
    },
    genre: (v) => {
      if (!v?.trim()) return "El género es obligatorio.";
      return "";
    },
    seasons: (v) => {
      const num = parseInt(v, 10);
      if (v === "" || isNaN(num)) return "El número de temporadas es obligatorio.";
      if (num <= 0) return "Debe ser mayor que 0.";
      return "";
    },
    release_date: (v) => {
      if (!v) return "La fecha de estreno es obligatoria.";
      const d = new Date(v);
      if (isNaN(d.getTime())) return "Fecha no válida.";
      return "";
    },
    minimum_age: (v) => {
      const num = parseInt(v, 10);
      if (v === "" || isNaN(num)) return "La edad mínima es obligatoria.";
      if (num < 0) return "Debe ser un número positivo.";
      return "";
    }
  };

  useEffect(() => {
    // Cargar la serie
    fetch(`http://localhost:3001/api/series/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la serie");
        return res.json();
      })
      .then(data => {
        setSerie(data.series);
        setOriginalSerie(data.series); // 👈 guarda el original al cargar
      })
      .catch(err => {
        console.error("Error al cargar serie:", err);
        setError("Serie no encontrada");
      });

    // Cargar likes y favoritos si hay perfil
    const id_profile = localStorage.getItem("id_profile");
    if (id_profile) {
      const numericId = Number(id);

      // Likes
      fetch(`http://localhost:3001/api/likes/${id_profile}`)
        .then(res => res.json())
        .then(data => {
          const liked = data.likes?.some(l => Number(l.id_series) === numericId);
          setIsLiked(Boolean(liked));
        })
        .catch(err => console.error("Error cargando likes:", err));

      // Favoritos
      fetch(`http://localhost:3001/api/favorites/${id_profile}`)
        .then(res => res.json())
        .then(data => {
          const fav = data.favorites?.some(f => Number(f.id_series) === numericId);
          setIsFavorite(Boolean(fav));
        })
        .catch(err => console.error("Error cargando favoritos:", err));
    }
  }, [id]);

  const toggleLike = () => {
    const id_profile = localStorage.getItem("id_profile");
    if (!id_profile || !serie?.id_series) return;

    if (!isLiked) {
      fetch("http://localhost:3001/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profile, id_series: serie.id_series })
      })
        .then(() => setIsLiked(true))
        .catch(err => console.error("Error al dar like:", err));
    } else {
      fetch(`http://localhost:3001/api/likes/${id_profile}/${serie.id_series}`, {
        method: "DELETE"
      })
        .then(() => setIsLiked(false))
        .catch(err => console.error("Error al quitar like:", err));
    }
  };

  const toggleFavorite = () => {
    const id_profile = localStorage.getItem("id_profile");
    if (!id_profile || !serie?.id_series) return;

    if (!isFavorite) {
      fetch("http://localhost:3001/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profile, id_series: serie.id_series })
      })
        .then(() => setIsFavorite(true))
        .catch(err => console.error("Error al añadir favorito:", err));
    } else {
      fetch(`http://localhost:3001/api/favorites/${id_profile}/${serie.id_series}`, {
        method: "DELETE"
      })
        .then(() => setIsFavorite(false))
        .catch(err => console.error("Error al quitar favorito:", err));
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setSerie(prev => ({ ...prev, [name]: value }));
  };

  const startEditing = () => {
    setOriginalSerie({ ...serie }); 
    setIsEditing(true);
    setFieldErrors({});
    setError("");
  };

  const handleCancel = () => {
    if (originalSerie) {
      setSerie(originalSerie); 
    }
    setIsEditing(false);
    setError("");
    setFieldErrors({});
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!serie) return;

    // Validación
    const errors = {};
    for (const field in validators) {
      const value = serie[field];
      const errorMsg = validators[field](value);
      if (errorMsg) errors[field] = errorMsg;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setError("❌ No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    if (role !== "admin") {
      setError("❌ No tienes permisos para editar esta serie.");
      return;
    }

    const payload = {
      ...serie,
      release_date:
        typeof serie.release_date === "string"
          ? serie.release_date.slice(0, 10)
          : new Date(serie.release_date).toISOString().slice(0, 10)
    };

    fetch(`http://localhost:3001/api/series/${serie.id_series}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || `Error ${res.status}`);
        }
        // Éxito: actualizamos originalSerie para que el próximo cancelar use el nuevo estado
        setOriginalSerie({ ...serie });
        setIsEditing(false);
        setError("");
      })
      .catch(err => {
        console.error("Error en actualización:", err);
        setError(`No se pudo actualizar: ${err.message}`);
      });
  };

  if (error) return <p className="error-message">{error}</p>;
  if (!serie) return <Loading />;

  const releaseDateValue =
    typeof serie.release_date === "string"
      ? serie.release_date.slice(0, 10)
      : new Date(serie.release_date).toISOString().slice(0, 10);

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate("/series")}>←</button>

      <div className="detail">
        <img
          src={`/images-series/${serie.image}`}
          alt={serie.title}
          className="banner-image"
          onError={e => (e.target.style.display = "none")}
        />

        <div className="info">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <input
                name="title"
                value={serie.title ?? ""}
                onChange={handleChange}
                placeholder="Título"
              />
              {fieldErrors.title && <span className="error">{fieldErrors.title}</span>}

              <textarea
                name="description"
                value={serie.description ?? ""}
                onChange={handleChange}
                placeholder="Descripción"
                rows="4"
              />
              {fieldErrors.description && <span className="error">{fieldErrors.description}</span>}

              <input
                name="genre"
                value={serie.genre ?? ""}
                onChange={handleChange}
                placeholder="Género"
              />
              {fieldErrors.genre && <span className="error">{fieldErrors.genre}</span>}

              <input
                name="seasons"
                type="number"
                value={serie.seasons ?? ""}
                onChange={handleChange}
                min="0"
                placeholder="Temporadas"
              />
              {fieldErrors.seasons && <span className="error">{fieldErrors.seasons}</span>}

              <input
                name="release_date"
                type="date"
                value={releaseDateValue}
                onChange={handleChange}
              />
              {fieldErrors.release_date && <span className="error">{fieldErrors.release_date}</span>}

              <input
                name="minimum_age"
                type="number"
                value={serie.minimum_age ?? ""}
                onChange={handleChange}
                min="0"
                placeholder="Edad mínima"
              />
              {fieldErrors.minimum_age && <span className="error">{fieldErrors.minimum_age}</span>}

              <div className="btns">
                <button type="submit" className="btn-edit">Guardar</button>
                <button
                  type="button"
                  className="btn-edit cancel"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
              {error && <p className="error-message" style={{ marginTop: "10px" }}>{error}</p>}
            </form>
          ) : (
            <>
              <h1>{serie.title}</h1>
              <div className="data">
                <div className="row1">
                  <p>{serie.genre}</p>
                  <p>{serie.seasons} temporadas</p>
                </div>
                <div className="row2">
                  <p>{new Date(serie.release_date).getFullYear()}</p>
                  <p>+{serie.minimum_age}</p>
                </div>
              </div>

              <p>{serie.description || "Sin descripción disponible"}</p>

              <div className="buttons-rep">
                <button className="btn play">▶ Reproducir</button>

                <div className="images">
                  <button onClick={toggleLike} aria-label={isLiked ? "Quitar like" : "Dar like"}>
                    <img
                      src={isLiked ? likeFilled : like}
                      alt="like"
                      className={`like-image ${isLiked ? "active" : ""}`}
                    />
                  </button>

                  <button onClick={toggleFavorite} aria-label={isFavorite ? "Quitar favorito" : "Añadir a favoritos"}>
                    <img
                      src={isFavorite ? starFilled : star}
                      alt="favorito"
                      className={`star-image ${isFavorite ? "active" : ""}`}
                    />
                  </button>

                  {localStorage.getItem("role") === "admin" && (
                    <button onClick={startEditing} aria-label="Editar">
                      <img src={pen} alt="Editar" className="pen-image" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}