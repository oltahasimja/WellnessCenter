import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const NotificationSoundContext = createContext();

export const useNotificationSound = () => useContext(NotificationSoundContext);

export const NotificationSoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/sound/livechat-129007.mp3');
    audioRef.current.preload = 'auto';
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleUserInteraction = async () => {
      try {
        if (audioRef.current && !audioInitialized) {
          await audioRef.current.play().catch(() => {});
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setAudioInitialized(true);
        }
      } catch (err) {
        console.log("Audio interaction error:", err);
      }

      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [audioInitialized]);

  useEffect(() => {
    const saved = localStorage.getItem('notificationSoundEnabled');
    if (saved !== null) setSoundEnabled(saved === 'true');
  }, []);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('notificationSoundEnabled', newValue.toString());
    if (newValue) playNotificationSound();
  };

  const playNotificationSound = async () => {
    if (!soundEnabled || !audioRef.current || !audioInitialized) return;
    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (err) {
      console.error("Failed to play sound:", err);
    }
  };

  return (
    <NotificationSoundContext.Provider value={{
      soundEnabled,
      toggleSound,
      audioInitialized,
      playNotificationSound,
    }}>
      {children}
    </NotificationSoundContext.Provider>
  );
};
