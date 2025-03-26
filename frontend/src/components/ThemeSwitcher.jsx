import { useTheme } from "./ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";  

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 dark:text-white"
    >
      {theme === "dark" ? (
        <FaSun className="text-yellow-500" /> // Sun icon for light mode
      ) : (
        <FaMoon className="text-gray-800" /> // Moon icon for dark mode
      )}
    </button>
  );
}

export default ThemeSwitcher;
