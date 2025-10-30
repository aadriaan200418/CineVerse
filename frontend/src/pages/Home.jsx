import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeaturedMovie from '../components/FeaturedMovie';
import MovieCard from '../components/MovieCard';

const posterPlaceholder = 'https://via.placeholder.com/300x450';

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-purple-900/80 to-gray-900 text-white">
      <Navbar />

      <FeaturedMovie
        title="Matrix Resurrections"
        subtitle="La última entrega de la saga"
        image={posterPlaceholder}
      />

      <section className="p-6 space-y-6">
        <MovieRow title="Tendencias" movies={[posterPlaceholder, posterPlaceholder, posterPlaceholder, posterPlaceholder, posterPlaceholder]} />
        <MovieRow title="Más vistas" movies={[posterPlaceholder, posterPlaceholder, posterPlaceholder, posterPlaceholder, posterPlaceholder]} />
        <MovieRow title="Recomendadas" movies={[posterPlaceholder, posterPlaceholder, posterPlaceholder, posterPlaceholder, posterPlaceholder]} />
      </section>

      <Footer />
    </div>
  );
}

function MovieRow({ title, movies }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <div className="flex space-x-4 overflow-x-auto scrollbar-thin p-2">
        {movies.map((movie, index) => (
          <MovieCard key={index} title={`Pelicula ${index + 1}`} image={movie} />
        ))}
      </div>
    </div>
  );
}

export default Home;
