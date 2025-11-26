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
  const [error, setError] = useState("");
  const [formError, setFormError] = useState(""); // errores de formulario
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3001/api/movies/${id}`)
      .then(res => res.json())
      .then(data => setMovie(data.movie))
      .catch(() => setError("Película no encontrada"));

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
      }).then(() => setIsLiked(true));
    } else {
      fetch(`http://localhost:3001/api/likes/${id_profile}/${movie.id_movie}`, {
        method: "DELETE"
      }).then(() => setIsLiked(false));
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
      }).then(() => setIsFavorite(true));
    } else {
      fetch(`http://localhost:3001/api/favorites/${id_profile}/${movie.id_movie}`, {
        method: "DELETE"
      }).then(() => setIsFavorite(false));
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setMovie(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!movie) return;

    // Validar campos obligatorios y especificar cuál falla
    const missingFields = [];
    if (!movie.title?.trim()) missingFields.push("Título");
    if (!movie.description?.trim()) missingFields.push("Descripción");
    if (!movie.genre?.trim()) missingFields.push("Género");
    if (!movie.duration_minutes) missingFields.push("Duración (minutos)");
    if (!movie.release_date) missingFields.push("Fecha de estreno");
    if (!movie.minimum_age) missingFields.push("Edad mínima");

    if (missingFields.length > 0) {
      setFormError(`⚠️ Debes rellenar: ${missingFields.join(", ")}`);
      return;
    }

    // Normalizar fecha al formato YYYY-MM-DD
    const payload = {
      ...movie,
      release_date:
        typeof movie.release_date === "string"
          ? movie.release_date.slice(0, 10)
          : new Date(movie.release_date).toISOString().slice(0, 10)
    };

    fetch(`http://localhost:3001/api/movies/${movie.id_movie}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al actualizar");
        setIsEditing(false);
        setFormError(""); // limpiar error si todo va bien
      })
      .catch(() => setError("No se pudo actualizar la película"));
  };

  if (error) return <p>{error}</p>;
  if (!movie) return <Loading />;

  // Valor seguro para mostrar en el input type="date"
  let releaseDateValue = "";
  if (movie.release_date) {
    if (typeof movie.release_date === "string") {
      releaseDateValue = movie.release_date.slice(0, 10);
    } else {
      releaseDateValue = new Date(movie.release_date).toISOString().slice(0, 10);
    }
  }

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate("/movies")}>←</button>

      <div className="detail">
        <img src={`/images-movies/${movie.image}`} alt={movie.title} className="banner-image" />

        <div className="info">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              {formError && <p style={{ color: "red", fontWeight: "bold" }}>{formError}</p>}
              <input name="title" value={movie.title ?? ""} onChange={handleChange} placeholder="Título" />
              <textarea name="description" value={movie.description ?? ""} onChange={handleChange} placeholder="Descripción" />
              <input name="genre" value={movie.genre ?? ""} onChange={handleChange} placeholder="Género" />
              <input name="duration_minutes" type="number" value={movie.duration_minutes ?? ""} onChange={handleChange} placeholder="Duración (min)" />
              <input name="release_date" type="date" value={releaseDateValue} onChange={handleChange} />
              <input name="minimum_age" type="number" value={movie.minimum_age ?? ""} onChange={handleChange} placeholder="Edad mínima" />
              <button type="submit" className="btn save">💾 Guardar</button>
              <button type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
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
            </>
          )}

          <div className="buttons-rep">
            <button className="btn play">▶ Reproducir</button>

            <div className="images">
              <button onClick={toggleLike}>
                <img src={isLiked ? likeFilled : like} alt="like" className={`like-image ${isLiked ? "active" : ""}`} />
              </button>

              <button onClick={toggleFavorite}>
                <img src={isFavorite ? starFilled : star} alt="favorite" className={`star-image ${isFavorite ? "active" : ""}`} />
              </button>

              {localStorage.getItem("role") === "admin" && (
                <button onClick={() => setIsEditing(true)}>
                  <img src={pen} alt="Editar" className="pen-image" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
