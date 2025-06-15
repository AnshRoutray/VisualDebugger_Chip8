interface ButtonProp {
  children: string;
  onClick: () => void;
  disabled?: boolean
}

const Button = ({ children, onClick, disabled = false}: ButtonProp) => {
  return (
    <button disabled = {disabled} className="btn btn-primary align-self-center" onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
