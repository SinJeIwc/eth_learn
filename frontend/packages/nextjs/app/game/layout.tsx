import type { ReactNode } from "react";
import { VT323 } from "next/font/google";

const silkscreen = VT323({
  subsets: ["latin"],
  weight: ["400"],
});

const GameLayout = ({ children }: { children: ReactNode }) => {
  return <div className={silkscreen.className}>{children}</div>;
};

export default GameLayout;
