function FeaturedMovie({ title, subtitle, image }) {
  return (
    <div
      className="relative h-[450px] mb-8 rounded-lg overflow-hidden shadow-2xl"
      style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-900/80 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h2 className="text-5xl font-bold">{title}</h2>
        <p className="mt-2 text-lg">{subtitle}</p>
        <button className="mt-4 bg-red-600 hover:bg-red-700 py-2 px-4 rounded shadow-lg transition transform hover:scale-105">
          Ver ahora
        </button>
      </div>
    </div>
  );
}

export default FeaturedMovie;
