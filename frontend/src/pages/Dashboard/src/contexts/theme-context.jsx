import { createContext, useEffect, useState } from "react";

export const ThemeProviderContext = createContext({
  theme: "light",
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const storageKey = "vite-ui-theme";
  const [theme, setThemeState] = useState(() => localStorage.getItem(storageKey) || "light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme === "dark" ? "dark" : "light");
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
