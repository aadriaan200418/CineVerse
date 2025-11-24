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
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

 useEffect(() => {
  fetch(`http://localhost:3001/api/movies/${id}`)
    .then(res => res.json())
    .then(data => setMovie(data.movie))
    .catch(() => setError("Película no encontrada"));

  const id_profile = localStorage.getItem("id_profile");
  if (id_profile) {
    const numericId = Number(id);

    // Comprobar likes
    fetch(`http://localhost:3001/api/likes/${id_profile}`)
      .then(res => res.json())
      .then(data => {
        const liked = data.likes?.some(l => Number(l.id_movie) === numericId);
        setIsLiked(Boolean(liked));
      })
      .catch(err => console.error("Error cargando likes:", err));

    // Comprobar favoritos
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
      // Añadir like
      fetch("http://localhost:3001/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profile, id_movie: movie.id_movie })
      }).then(() => setIsLiked(true));
    } else {
      // Eliminar like
      fetch(`http://localhost:3001/api/likes/${id_profile}/${movie.id_movie}`, {
        method: "DELETE"
      }).then(() => setIsLiked(false));
    }
  };

  const toggleFavorite = () => {
    const id_profile = localStorage.getItem("id_profile");
    if (!id_profile || !movie?.id_movie) return;

    if (!isFavorite) {
      // Añadir favorito
      fetch("http://localhost:3001/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_profile, id_movie: movie.id_movie })
      }).then(() => setIsFavorite(true));
    } else {
      // Eliminar favorito
      fetch(`http://localhost:3001/api/favorites/${id_profile}/${movie.id_movie}`, {
        method: "DELETE"
      }).then(() => setIsFavorite(false));
    }
  };

  if (error) return <p>{error}</p>;
  if (!movie) return <Loading />;

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate("/movies")}>←</button>

      <div className="detail">
        <img src={`/images-movies/${movie.image}`} alt={movie.title} className="banner-image" />

        <div className="info">
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
              <button onClick={toggleLike}>
                <img
                  src={isLiked ? likeFilled : like}
                  alt="like"
                  className={`like-image ${isLiked ? "active" : ""}`}
                />
              </button>

              <button onClick={toggleFavorite}>
                <img
                  src={isFavorite ? starFilled : star}
                  alt="favorite"
                  className={`star-image ${isFavorite ? "active" : ""}`}
                />
              </button>


              {localStorage.getItem("role") === "admin" && (
                <button onClick={() => navigate(`/movies/edit/${movie.id_movie}`)}>
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
