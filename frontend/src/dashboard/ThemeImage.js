// src/components/ThemeImage.js
import React from 'react';

const ThemeImage = ({ theme, className }) => {
  if (!theme?.images?.length) return null;
  
  // Get the first image (or random if you prefer)
  const imageSrc = theme.images[0];
  
  // Handle both imported images and string paths
  const imgSource = typeof imageSrc === 'string' ? imageSrc : imageSrc.default || imageSrc;

  return (
    <div className={`${className} overflow-hidden rounded-lg shadow-lg`}>
      <img 
        src={imgSource}
        alt={theme.themeName} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default ThemeImage;