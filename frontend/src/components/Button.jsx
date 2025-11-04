// src/components/Button.jsx

// Definimos el componente funcional Button, que recibe tres props:
// - text: el texto que se mostrará dentro del botón
// - onClick: la función que se ejecutará al hacer clic
// - className: clases CSS adicionales para personalizar el estilo
const Button = ({ text, onClick, className }) => {
  return (
    // Renderizamos un elemento <button>
    // - 'onClick' ejecuta la función pasada por props cuando se pulsa el botón
    // - 'className' define el estilo del botón combinando estilos base y personalizados
    <button
      onClick={onClick}
      className={`px-12 py-4 text-xl font-bold rounded-full ${className}`}
    >
      {/* El contenido del botón es el texto recibido por props */}
      {text}
    </button>
  );
};

// Exportamos el componente para poder usarlo en otros archivos
export default Button;
