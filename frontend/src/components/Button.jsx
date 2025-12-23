// Definimos el componente funcional Button, que recibe tres props:
const Button = ({ text, onClick, className }) => {
  return (
    <button onClick={onClick} className={`px-12 py-4 text-xl font-bold rounded-full ${className}`}>{text}</button>
  );
};

// Exportamos el componente para poder usarlo en otros archivos
export default Button;