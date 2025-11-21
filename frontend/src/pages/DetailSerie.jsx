import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/detail.css";
import Loading from "../components/Loading";
export default function DetailSerie({ user }) {
  const { id } = useParams();
  const [serie, setSerie] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3001/api/series/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la serie");
        return res.json();
      })
      .then(data => setSerie(data.series))
      .catch(err => {
        console.error("Error al cargar serie:", err);
        setError("Serie no encontrada");
      });
  }, [id]);



if (error) return <p>{error}</p>;
if (!serie) return <Loading />;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <img src={`/images-series/${serie.image}`} alt={serie.title} className="banner-image" />
        <div className="info">
          <h1>{serie.title}</h1>
          <p>Género: {serie.genre}</p>
          <p>{serie.description || "Sin descripción disponible"}</p>

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
