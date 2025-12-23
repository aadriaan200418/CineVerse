// Importamos React y useState para manejar el estado del formulario
import React from "react";
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS
import "../css/carousel.css";

export default function Carousel({ title, items, imagePath }) {
  const navigate = useNavigate();

  const scrollLeft = (id) => {
    document.getElementById(id).scrollLeft -= 300;
  };

  const scrollRight = (id) => {
    document.getElementById(id).scrollLeft += 300;
  };

  const carouselId = `carousel-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="carousel-section">
      <h1>{title}</h1>
      <div className="carousel-container">
        <button className="carousel-scroll-button" onClick={() => scrollLeft(carouselId)}>←</button>

        <div className="carousel" id={carouselId}>
          {items.map((item) => (
            <div key={item.id_movie || item.id_series} className="carousel-card" onClick={() =>
              item.id_series
                ? navigate(`/series/${item.id_series}`)
                : navigate(`/movies/${item.id_movie}`)
              }>
                
              <img src={`/${imagePath}/${item.image}`} alt={item.title} className="carousel-card-image" />
            </div>
          ))}
        </div>

        <button className="carousel-scroll-button" onClick={() => scrollRight(carouselId)}>→</button>
      </div>
    </div>
  );
}
