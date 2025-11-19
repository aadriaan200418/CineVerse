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
            <div key={item.id_movie || item.id_series} className="card">
              <img
                src={`/${imagePath}/${item.image}`}
                alt={item.title}
                className="card-image"
              />
              <div className="card-info">
                <strong>{item.title}</strong>
              </div>
            </div>
          ))}
        </div>

        <button className="scroll-button right" onClick={() => scrollRight(carouselId)}>→</button>
      </div>
    </div>
  );
}
