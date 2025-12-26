import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative p-2 rounded-xl transition-all duration-300 ${isDark
                    ? 'bg-secondary-800 hover:bg-secondary-700 text-yellow-400'
                    : 'bg-primary-50 hover:bg-primary-100 text-primary-600'
                } ${className}`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div className="relative w-5 h-5">
                {/* Sun icon */}
                <Sun
                    size={20}
                    className={`absolute inset-0 transition-all duration-300 ${isDark
                            ? 'opacity-0 rotate-90 scale-0'
                            : 'opacity-100 rotate-0 scale-100'
                        }`}
                />
                {/* Moon icon */}
                <Moon
                    size={20}
                    className={`absolute inset-0 transition-all duration-300 ${isDark
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-0'
                        }`}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
