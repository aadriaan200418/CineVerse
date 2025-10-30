function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Cineverse</h1>
      <div className="space-x-4">
        <a href="/" className="hover:text-red-500">Inicio</a>
        <a href="/peliculas" className="hover:text-red-500">Películas</a>
        <a href="/series" className="hover:text-red-500">Series</a>
        <a href="/mi-cuenta" className="hover:text-red-500">Mi cuenta</a>
      </div>
    </nav>
  );
}

export default Navbar;
