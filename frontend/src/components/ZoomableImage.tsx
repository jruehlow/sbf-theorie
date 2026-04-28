import React, { useEffect, useState } from "react";
import { FaMagnifyingGlassPlus, FaXmark } from "react-icons/fa6";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  className = "",
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="mx-auto inline-flex flex-col items-center gap-2">
        <img
          src={src}
          alt={alt}
          className={className}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          aria-label="Bild vergrößern"
        >
          <FaMagnifyingGlassPlus className="h-3.5 w-3.5" />
          Vergrößern
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Vergrößertes Fragebild"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-900 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Bild schließen"
          >
            <FaXmark className="h-5 w-5" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[88vh] max-w-[96vw] rounded-lg bg-white object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ZoomableImage;
