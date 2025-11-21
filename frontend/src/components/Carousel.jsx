// Importamos React y useState para manejar el estado del formulario
import React from "react";
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS
import "../css/carousel.css";

// Definimos el componente principal del componenete carrusel
export default function Carousel({ title, items, imagePath }) {
  const navigate = useNavigate();

  //Flecha izquierda
  const scrollLeft = (id) => {
    document.getElementById(id).scrollLeft -= 300;
  };

  //Flecha derecha
  const scrollRight = (id) => {
    document.getElementById(id).scrollLeft += 300;
  };

  const carouselId = `carousel-${title.replace(/\s+/g, "-").toLowerCase()}`;

  //Carrusel
  return (
    <div className="carousel-section">
      <h1>{title}</h1>
      <div className="carousel-container">
        <button className="scroll-button left" onClick={() => scrollLeft(carouselId)}>←</button>

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

        <button className="scroll-button right" onClick={() => scrollRight(carouselId)}>→</button>
      </div>
    </div>
  );
}
