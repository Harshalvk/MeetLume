import { instrumentSerif } from "@/lib/fonts";
import React from "react";

const Logo = () => {
  return (
    <h1 className={`text-xl sm:text-2xl ${instrumentSerif.className}`}>
      MeetLume
    </h1>
  );
};

export default Logo;
