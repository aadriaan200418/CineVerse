function MovieCard({ title, image }) {
  return (
    <div className="w-48 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transform transition shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-purple-600">
      <img src={image} alt={title} className="w-full h-64 object-cover" />
      <div className="p-2 text-white font-semibold">{title}</div>
    </div>
  );
}

export default MovieCard;
