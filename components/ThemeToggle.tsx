"use client";

import React, { useState } from "react";
import { ThemeSwitcher } from "./ui/theme-switcher";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  return (
    <ThemeSwitcher defaultValue="system" onChange={setTheme} value={theme} />
  );
};

export default ThemeToggle;
