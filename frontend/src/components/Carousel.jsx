import React from "react";
import { useNavigate } from "react-router-dom";
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

  const handleClick = (item) => {
    if (item.id_movie) navigate(`/movies/${item.id_movie}`);
    else if (item.id_series) navigate(`/series/${item.id_series}`);
    else if (item.id_chapter) navigate(`/chapters/${item.id_chapter}`);
  };

  const getKey = (item) =>
    item.id_movie || item.id_series || item.id_chapter;

  const isChapter = (item) => item.id_chapter !== undefined;

  return (
    <div className="carousel-section">
      <h1>{title}</h1>

      <div className="carousel-container">
        <button className="carousel-scroll-button" onClick={() => scrollLeft(carouselId)}>←</button>

        <div className="carousel" id={carouselId}>
          {items.map((item) => (
            <div key={getKey(item)} className={`carousel-card ${isChapter(item) ? "chapter-card" : ""}`} onClick={() => handleClick(item)}>
              <img src={`/${imagePath}/${item.image}`} alt={item.title} className="carousel-card-image"/>
      
              {isChapter(item) && (
                <div className="detailSerie-chapter-card">
                  <h3>{item.chapter_number}. {item.title}</h3>
                  <p>{item.duration_minutes} min</p>
                </div>
              )}

              {/* Movies / Series (si no es capítulo) */}
              {!isChapter(item) && item.title && (
                <div className="carousel-card-info">
                  <h3>{item.title}</h3>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="carousel-scroll-button" onClick={() => scrollRight(carouselId)}>→</button>
      </div>
    </div>
  );
}
