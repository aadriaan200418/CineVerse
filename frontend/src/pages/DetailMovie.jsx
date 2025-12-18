import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/detail.css";
import like from "../assets/icons/like.png";
import likeFilled from "../assets/icons/like-filled.png";
import star from "../assets/icons/star.png";
import starFilled from "../assets/icons/star-filled.png";
import pen from "../assets/icons/pen.png";
import Loading from "../components/Loading";

export default function DetailMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [originalMovie, setOriginalMovie] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); 

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
    duration_minutes: (v) => {
      const num = parseInt(v, 10);
      if (v === "" || isNaN(num)) return "La duración es obligatoria.";
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
    // Reiniciar estados al cambiar de película
    setLoading(true);
    setError("");
    setMovie(null);
    setIsLiked(false);
    setIsFavorite(false);

    // 1. Cargar la película (bloquea el loading)
    fetch(`http://localhost:3001/api/movies/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la película");
        return res.json();
      })
      .then(data => {
        setMovie(data.movie);
        setOriginalMovie(data.movie);
      })
      .catch(err => {
        console.error("Error al cargar película:", err);
        setError("Película no encontrada");
      })
      .finally(() => {
        // Solo cuando termina la carga principal, quitamos el loading
        setLoading(false);
      });

    // 2. Cargar likes y favoritos (en segundo plano, sin afectar loading)
    const id_profile = localStorage.getItem("id_profile");
    if (id_profile) {
      const numericId = Number(id);

      fetch(`http://localhost:3001/api/likes/${id_profile}`)
        .then(res => res.json())
        .then(data => {
          const liked = data.likes?.some(l => Number(l.id_movie) === numericId);
          setIsLiked(Boolean(liked));
        })
        .catch(err => console.error("Error cargando likes:", err));

      fetch(`http://localhost:3001/api/favorites/${id_profile}`)
        .then(res => res.json())
        .then(data => {
          const fav = data.favorites?.some(f => Number(f.id_movie) === numericId);
          setIsFavorite(Boolean(fav));
        })
        .catch(err => console.error("Error cargando favoritos:", err));
    }
  }, [id]);

  const toggleLike = () => {
    const id_profile = localStorage.getItem("id_profile");
    if (!id_profile || !movie?.id_movie) return;

    if (!isLiked) {
      fetch("http://localhost:3001/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profile, id_movie: movie.id_movie })
      })
        .then(() => setIsLiked(true))
        .catch(err => console.error("Error al dar like:", err));
    } else {
      fetch(`http://localhost:3001/api/likes/${id_profile}/${movie.id_movie}`, {
        method: "DELETE"
      })
        .then(() => setIsLiked(false))
        .catch(err => console.error("Error al quitar like:", err));
    }
  };

  const toggleFavorite = () => {
    const id_profile = localStorage.getItem("id_profile");
    if (!id_profile || !movie?.id_movie) return;

    if (!isFavorite) {
      fetch("http://localhost:3001/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profile, id_movie: movie.id_movie })
      })
        .then(() => setIsFavorite(true))
        .catch(err => console.error("Error al añadir favorito:", err));
    } else {
      fetch(`http://localhost:3001/api/favorites/${id_profile}/${movie.id_movie}`, {
        method: "DELETE"
      })
        .then(() => setIsFavorite(false))
        .catch(err => console.error("Error al quitar favorito:", err));
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setMovie(prev => ({ ...prev, [name]: value }));
  };

  const startEditing = () => {
    setOriginalMovie({ ...movie });
    setIsEditing(true);
    setFieldErrors({});
    setError("");
  };

  const handleCancel = () => {
    if (originalMovie) {
      setMovie(originalMovie);
    }
    setIsEditing(false);
    setError("");
    setFieldErrors({});
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!movie) return;

    const errors = {};
    for (const field in validators) {
      const value = movie[field];
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
      setError(" No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    if (role !== "admin") {
      setError(" No tienes permisos para editar esta película.");
      return;
    }

    const payload = {
      ...movie,
      release_date:
        typeof movie.release_date === "string"
          ? movie.release_date.slice(0, 10)
          : new Date(movie.release_date).toISOString().slice(0, 10)
    };

    fetch(`http://localhost:3001/api/movies/${movie.id_movie}`, {
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
        setOriginalMovie({ ...movie });
        setIsEditing(false);
        setError("");
      })
      .catch(err => {
        console.error("Error en actualización:", err);
        setError(`No se pudo actualizar: ${err.message}`);
      });
  };

  //  Manejo de loading y errores al inicio
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!movie) {
    return <Loading />; // fallback por si acaso
  }

  const releaseDateValue =
    typeof movie.release_date === "string"
      ? movie.release_date.slice(0, 10)
      : new Date(movie.release_date).toISOString().slice(0, 10);

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate("/movies")}>←</button>

      <div className="detail">
        <img
          src={`/images-movies/${movie.image}`}
          alt={movie.title}
          className="banner-image"
          onError={e => (e.target.style.display = "none")}
        />

        <div className="info">
          {isEditing ? (
            <form onSubmit={handleSubmit} noValidate>
              <input
                name="title"
                value={movie.title ?? ""}
                onChange={handleChange}
                placeholder="Título"
              />
              {fieldErrors.title && <span className="error">{fieldErrors.title}</span>}

              <textarea
                name="description"
                value={movie.description ?? ""}
                onChange={handleChange}
                placeholder="Descripción"
                rows="4"
              />
              {fieldErrors.description && <span className="error">{fieldErrors.description}</span>}

              <input
                name="genre"
                value={movie.genre ?? ""}
                onChange={handleChange}
                placeholder="Género"
              />
              {fieldErrors.genre && <span className="error">{fieldErrors.genre}</span>}

              <input
                name="duration_minutes"
                type="number"
                value={movie.duration_minutes ?? ""}
                onChange={handleChange}
                min="0"
                placeholder="Duración (minutos)"
              />
              {fieldErrors.duration_minutes && <span className="error">{fieldErrors.duration_minutes}</span>}

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
                value={movie.minimum_age ?? ""}
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
              <h1>{movie.title}</h1>
              <div className="data">
                <div className="row1">
                  <p>{movie.genre}</p>
                  <p>{movie.duration_minutes} min</p>
                </div>
                <div className="row2">
                  <p>{new Date(movie.release_date).getFullYear()}</p>
                  <p>+{movie.minimum_age}</p>
                </div>
              </div>

              <p>{movie.description || "Sin descripción disponible"}</p>

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