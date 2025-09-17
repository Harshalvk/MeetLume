import { spectral } from "@/lib/fonts";
import React from "react";

const Logo = () => {
  return (
    <h1
      className={`font-semibold tracking-tighter text-xl sm:text-2xl ${spectral.className}`}
    >
      MeetLume
    </h1>
  );
};

export default Logo;
