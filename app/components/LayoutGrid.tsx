import type { ReactNode } from "react";

type LayoutGridProps = {
  children: ReactNode;
  className?: string;
};

export const LayoutGrid = ({ children, className }: LayoutGridProps) => {
  return (
    <div
      className={`grid grid-cols-2 md:gap-x-[17px] [grid-auto-rows:17px] md:[grid-template-columns:repeat(18,minmax(0,1fr))] ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
};

