import React from "react";

const Button = ({ children, className = "", variant, ...props }) => {
  const base = "rounded px-4 py-2 font-medium transition-colors duration-200";
  const styles = variant === "outline"
    ? "border-2 border-button text-button hover:bg-button hover:text-white"
    : "bg-button text-white hover:bg-opacity-90";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
