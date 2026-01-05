// Importamos React y hooks
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Importamos los estilos CSS, los iconos y componentes
import "../css/home.css";
import userIcon from "../assets/icons/user.png";
import settingsIcon from "../assets/icons/settings.png";
import Loading from "../components/Loading";
import Carousel from "../components/Carousel";

export default function Home({ view: initialView = "inicio" }) {
  const [role, setRole] = useState("");
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [view, setView] = useState(initialView);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [likes, setLikes] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [topSeries, setTopSeries] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [selectedSeriesGenre, setSelectedSeriesGenre] = useState(null);
  const [selectedMovieGenre, setSelectedMovieGenre] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const id_profile = localStorage.getItem("id_profile");
    setRole(storedRole);

    // Cargar películas
    fetch("http://localhost:3001/api/movies")
      .then(res => res.json())
      .then(data => {
        setMovies(data.movies);
        setLoadingMovies(false);
      })
      .catch(err => {
        console.error("Error cargando películas:", err);
        setLoadingMovies(false);
      }
    );

    // Cargar series
    fetch("http://localhost:3001/api/series")
      .then(res => res.json())
      .then(data => {
        setSeries(data.series);
        setLoadingSeries(false);
      })
      .catch(err => {
        console.error("Error cargando series:", err);
        setLoadingSeries(false);
      }
    );

    // Cargar Top 10 
    Promise.all([
      fetch("http://localhost:3001/api/top-movies").then(res => res.json()),
      fetch("http://localhost:3001/api/top-series").then(res => res.json())
    ])
      .then(([moviesRes, seriesRes]) => {
        setTopMovies(moviesRes.top_movies || []);
        setTopSeries(seriesRes.top_series || []);
        setLoadingTop(false);
      })
      .catch(err => {
        console.error("Error cargando Top 10:", err);
        setLoadingTop(false);
      });

    if (!id_profile) return;

    // Cargar favoritos
    fetch(`http://localhost:3001/api/favorites/${id_profile}`)
      .then(res => res.json())
      .then(data => setFavorites(data.favorites))
      .catch(err => console.error("Error cargando favoritos:", err));

    // Cargar likes
    fetch(`http://localhost:3001/api/likes/${id_profile}`)
      .then(res => res.json())
      .then(data => setLikes(data.likes))
      .catch(err => console.error("Error cargando likes:", err));
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const getRecommendedItems = () => {
    if (!likes.length) return [];

    const genres = likes
      .map(like => {
        if (like.id_movie) {
          const movie = movies.find(m => m.id_movie === like.id_movie);
          return movie?.genre;
        }
        if (like.id_series) {
          const serie = series.find(s => s.id_series === like.id_series);
          return serie?.genre;
        }
        return null;
      })
      .filter(Boolean);

    if (!genres.length) return [];

    const genreCount = genres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const topGenre = Object.keys(genreCount).reduce((a, b) =>
      genreCount[a] > genreCount[b] ? a : b
    );

    const recommendedMovies = movies.filter(m => m.genre === topGenre);
    const recommendedSeries = series.filter(s => s.genre === topGenre);

    return [...recommendedMovies, ...recommendedSeries];
  };

  const recommendedItems = getRecommendedItems();
  const recommendedSeries = recommendedItems.filter(item => item.id_series !== undefined);
  const recommendedMovies = recommendedItems.filter(item => item.id_movie !== undefined);

  // Géneros únicos
  const uniqueMovieGenres = [...new Set(movies.map(m => m.genre).filter(Boolean))];
  const uniqueSeriesGenres = [...new Set(series.map(s => s.genre).filter(Boolean))];

  // Filtrado
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().startsWith(searchTerm);
    const matchesGenre = selectedMovieGenre !== null ? movie.genre === selectedMovieGenre : true;
    return matchesSearch && matchesGenre;
  });

  const filteredSeries = series.filter(serie => {
    const matchesSearch = serie.title.toLowerCase().startsWith(searchTerm);
    const matchesGenre = selectedSeriesGenre !== null ? serie.genre === selectedSeriesGenre : true;
    return matchesSearch && matchesGenre;
  });

  // Próximos estrenos
  const today = new Date();
  const upcomingSeries = series.filter(s => new Date(s.release_date) > today);
  const upcomingMovies = movies.filter(m => new Date(m.release_date) > today);

  return (
    <div className="home-container">
      {/* Menú de navegación y buscador */}
      <nav className="top-menu">
        <div className="menu-left">
          {role === "admin" && (
            <>
              <button className="add-button" onClick={() => setOpen1(!open1)}>＋</button>
              {open1 && (
                <div className="dropdown-create">
                  <ul>
                    <li onClick={() => navigate("/create-admin?form=users-admin")}>Usuario / Admin</li>
                    <li onClick={() => navigate("/create-admin?form=movies-series")}>Película / Serie</li>
                  </ul>
                </div>
              )}
              <div className="back-point" onClick={() => navigate("/login")}>{localStorage.getItem("username") || "Usuario"}</div>
            </>
          )}

          {role === "user" && (
            <>
              <div className="profile-icon">
                <img src={userIcon} alt="Usuario" className="user-icon" onClick={() => navigate("/profiles")}/>
              </div>
              <div className="back-point">{localStorage.getItem("username") || "Usuario"}</div>
            </>
          )}
        </div>

        <div className="menu-center">
          <button onClick={() => setView("inicio")}>INICIO</button>
          <button onClick={() => setView("series")}>SERIES</button>
          <button onClick={() => setView("movies")}>PELÍCULAS</button>
          <button onClick={() => setView("favorites")}>FAVORITOS</button>
          <button onClick={() => setView("likes")}>ME GUSTA</button>
          <input type="text" placeholder="Buscar..." className="search-input" onChange={handleSearch}/>
        </div>

        {/* Funciones de settings */}
        <div className="menu-right">
          {role === "user" && (
            <img src={settingsIcon} alt="Settings" className="settings" onClick={() => navigate("/settings")}/>
          )}

          {role === "admin" && (
            <>
              <img src={settingsIcon} alt="Settings" className="settings" onClick={() => setOpen2(!open2)}
              />
              {open2 && (
                <div className="dropdown-settings">
                  <ul>
                    <li onClick={() => navigate("/settings?tab=users")}>Usuarios</li>
                    <li onClick={() => navigate("/settings?tab=admins")}>Administradores</li>
                    <li onClick={() => navigate("/settings?tab=movies")}>Películas</li>
                    <li onClick={() => navigate("/settings?tab=series")}>Series</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Vista Inicio */}
      {view === "inicio" && (
        <>
          <div className="featured-banner">
            <img src="/images-series/lidia_poet3.jpg" alt="La Ley de Lidia Poët" className="featured-image"/>
            <div className="featured-label">NUEVO ESTRENO</div>
          </div>

          {loadingSeries ? (
            <Loading />
          ) : (
            <Carousel title="Todas las Series" items={filteredSeries} imagePath="images-series"/>
          )}

          {loadingMovies ? (
            <Loading />
          ) : (
            <Carousel title="Todas las Películas" items={filteredMovies} imagePath="images-movies"/>
          )}
        </>
      )}

      {/* Vista Series */}
      {view === "series" && (
        <div className="section">
          <h2>Series</h2>
          {loadingSeries ? (
            <Loading />
          ) : (
            <>
              <Carousel title="Todas las Series" items={filteredSeries} imagePath="images-series"/>

              {loadingTop ? (
                <Loading />
              ) : (
                <Carousel title="Top 10 Series Más Likeadas" items={topSeries} imagePath="images-series"/>
              )}

              {upcomingSeries.length > 0 && (
                <Carousel title="Próximos Estrenos" items={upcomingSeries} imagePath="images-series"/>
              )}

              <Carousel title="Recomendadas" items={recommendedSeries} imagePath="images-series"/>
            </>
          )}

          <div className="genre-grid">
            <button className={`genre-button ${selectedSeriesGenre === null ? "active" : ""}`} onClick={() => setSelectedSeriesGenre(null)}>TODAS</button>
            
            {uniqueSeriesGenres.map(genre => (
              <button key={genre} className={`genre-button ${selectedSeriesGenre === genre ? "active" : ""}`} onClick={() => setSelectedSeriesGenre(genre)}>{genre.toUpperCase()}</button>
            ))}
          </div>
        </div>
      )}

      {/* Vista Películas */}
      {view === "movies" && (
        <div className="section">
          <h2>Películas</h2>
          {loadingMovies ? (
            <Loading />
          ) : (
            <>
              <Carousel
                title="Todas las Películas"
                items={filteredMovies}
                imagePath="images-movies"
              />

              {loadingTop ? (
                <Loading />
              ) : (
                <Carousel
                  title="Top 10 Películas Más Likeadas"
                  items={topMovies}
                  imagePath="images-movies"
                />
              )}

              {upcomingMovies.length > 0 && (
                <Carousel
                  title="Próximos Estrenos"
                  items={upcomingMovies}
                  imagePath="images-movies"
                />
              )}

              <Carousel
                title="Recomendadas"
                items={recommendedMovies}
                imagePath="images-movies"
              />
            </>
          )}

          <div className="genre-grid">
            <button
              className={`genre-button ${selectedMovieGenre === null ? "active" : ""}`}
              onClick={() => setSelectedMovieGenre(null)}
            >
              TODAS
            </button>
            {uniqueMovieGenres.map(genre => (
              <button
                key={genre}
                className={`genre-button ${selectedMovieGenre === genre ? "active" : ""}`}
                onClick={() => setSelectedMovieGenre(genre)}
              >
                {genre.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Favoritos */}
      {view === "favorites" && (
        <>
          <h2>Mis Favoritos</h2>

          {favorites.filter(f => f.id_movie).length > 0 && (
            <Carousel
              title="Películas Favoritas"
              items={favorites
                .filter(f => f.id_movie)
                .map(f => ({
                  id_movie: f.id_movie,
                  id_series: null,
                  image: f.movie_image,
                  title: f.movie_title
                }))}
              imagePath="images-movies"
            />
          )}

          {favorites.filter(f => f.id_series).length > 0 && (
            <Carousel
              title="Series Favoritas"
              items={favorites
                .filter(f => f.id_series)
                .map(f => ({
                  id_movie: null,
                  id_series: f.id_series,
                  image: f.series_image,
                  title: f.series_title
                }))}
              imagePath="images-series"
            />
          )}
        </>
      )}

      {/* Likes */}
      {view === "likes" && (
        <>
          <h2>Mis Likes</h2>

          {likes.filter(l => l.id_movie).length > 0 && (
            <Carousel
              title="Películas favoritas"
              items={likes
                .filter(l => l.id_movie)
                .map(l => ({
                  id_movie: l.id_movie,
                  id_series: null,
                  image: l.movie_image,
                  title: l.movie_title
                }))}
              imagePath="images-movies"
            />
          )}

          {likes.filter(l => l.id_series).length > 0 && (
            <Carousel
              title="Series favoritas"
              items={likes
                .filter(l => l.id_series)
                .map(l => ({
                  id_movie: null,
                  id_series: l.id_series,
                  image: l.series_image,
                  title: l.series_title
                }))}
              imagePath="images-series"
            />
          )}
        </>
      )}
    </div>
  );
}
