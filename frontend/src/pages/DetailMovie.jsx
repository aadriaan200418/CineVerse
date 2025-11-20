import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/detail.css";

export default function DetailMovie({ user }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/movies/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la película");
        return res.json();
      })
      .then(data => setMovie(data.movie))
      .catch(err => {
        console.error("Error al cargar película:", err);
        setError("Película no encontrada");
      });
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!movie) return <p>Cargando...</p>;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <img src={`/images/${movie.image}`} alt={movie.title} className="banner-image" />
        <div className="info">
          <h1>{movie.title}</h1>
          <p>Género: {movie.genre}</p>
          {/* Como tu JSON no tiene descripción, mostramos un texto por defecto */}
          <p>{movie.description || "Sin descripción disponible"}</p>

          <div className="buttons">
            <button className="btn1 play">▶ Reproducir</button>
            <button className="btn1 fav">★ Favoritos</button>
            <button className="btn1 like">👍 Like</button>
            {user?.role === "admin" && (
              <button className="btn1 edit">✎ Editar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
