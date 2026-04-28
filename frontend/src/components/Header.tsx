import React from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaRotateRight } from "react-icons/fa6";

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
  <header className="sticky top-0 z-10 border-b border-blue-800 bg-blue-700 text-white shadow-sm">
    <div className="mx-auto grid h-14 w-full max-w-2xl grid-cols-[auto_1fr_auto] items-center gap-2 px-3">
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <FaChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{backText}</span>
        </Link>
      )}
      {!backTo && <div />}

      <h1 className="truncate text-center text-base font-semibold text-white sm:text-lg">
        {title}
      </h1>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          title={resetText}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 ` +
            (resetButtonClassName ??
              "text-sm font-semibold text-blue-100 hover:bg-blue-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white")}
        >
          <FaRotateRight className="h-4 w-4" />
          <span className="hidden sm:inline">{resetText}</span>
        </button>
      )}
      {!onReset && <div />}
    </div>
  </header>
);

export default Header;
