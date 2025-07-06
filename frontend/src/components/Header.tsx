import React from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";

interface HeaderProps {
  title: string;
  backTo?: string;
  backText?: string;
  onReset?: () => void;
  resetText?: string;
  resetButtonClassName?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  backTo,
  backText = "Zurück",
  onReset,
  resetText = "Reset",
  resetButtonClassName,
}) => (
  <header className="bg-blue-600 text-white py-4">
    <div className="container px-2 flex items-center justify-center relative h-6">
      {backTo && (
        <Link
          to={backTo}
          className="absolute left-2 flex items-center text-white hover:opacity-80"
        >
          <FaChevronLeft className="w-5 h-5 mr-2" />
          {backText}
        </Link>
      )}

      <h1 className="text-l font-semibold text-white">{title}</h1>

      {onReset && (
        <button
          type="reset"
          onClick={onReset}
          className={`absolute right-2 ` +
            (resetButtonClassName ??
              "text-sm text-red-200 hover:text-red-100")}
        >
          {resetText}
        </button>
      )}
    </div>
  </header>
);

export default Header;
