import React from 'react';

const ThemeBackground = ({ theme, children }) => {
  // Fallback styles if theme is not loaded yet
  const defaultStyles = {
    backgroundColor: '#f0fdfa', // Default teal-50
    backgroundImage: 'none'
  };

  const backgroundStyles = theme ? {
    backgroundColor: theme.lightColor || '#f0fdfa',
    backgroundImage: theme.backgroundImage || 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  } : defaultStyles;

  const patternStyles = theme?.backgroundPattern ? {
    backgroundImage: theme.backgroundPattern,
    backgroundSize: '300px',
    backgroundRepeat: 'repeat',
    opacity: 0.1,
    mixBlendMode: 'overlay'
  } : {};

  return (
    <div 
      className="min-h-screen w-full transition-all duration-300"
      style={backgroundStyles}
    >
      {theme?.backgroundPattern && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={patternStyles}
        />
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default ThemeBackground;