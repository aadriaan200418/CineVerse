// src/components/Button.jsx
const Button = ({ text, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`px-12 py-4 text-xl font-bold rounded-full ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;
