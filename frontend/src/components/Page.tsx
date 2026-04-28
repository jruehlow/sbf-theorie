import React from "react";

interface PageProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const Page: React.FC<PageProps> = ({
  children,
  footer,
  className = "",
  contentClassName = "",
}) => (
  <div className={`flex flex-1 flex-col bg-slate-50 text-slate-900 ${className}`}>
    <main
      className={`mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:py-8 ${contentClassName}`}
    >
      {children}
    </main>
    {footer}
  </div>
);

export default Page;
