interface ButtonProp {
  children: string;
  onClick: () => void;
}

const Button = ({ children, onClick }: ButtonProp) => {
  return (
    <button className="btn btn-primary align-self-center" onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
