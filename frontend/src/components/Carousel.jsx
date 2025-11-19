import React from "react";
import "../css/carousel.css";

export default function Carousel({ title, items, imagePath }) {
  const scrollLeft = (id) => {
    document.getElementById(id).scrollLeft -= 300;
  };

  const scrollRight = (id) => {
    document.getElementById(id).scrollLeft += 300;
  };

  const carouselId = `carousel-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="carousel-section">
      <h2>{title}</h2>
      <div className="carousel-container">
        <button className="scroll-button left" onClick={() => scrollLeft(carouselId)}>←</button>

        <div className="carousel" id={carouselId}>
          {items.map((item) => (
            <div key={item.id_movie || item.id_series} className="carousel-card">
              <img
                src={`/${imagePath}/${item.image}`}
                alt={item.title}
                className="carousel-card-image"
              />
              <div className="carousel-card-overlay">
                <h3 className="carousel-card-title">{item.title}</h3>
                {item.genre && <p className="carousel-card-genre">{item.genre}</p>}
              </div>
            </div>

          ))}
        </div>

        <button className="scroll-button right" onClick={() => scrollRight(carouselId)}>→</button>
      </div>
    </div>
  );
}
