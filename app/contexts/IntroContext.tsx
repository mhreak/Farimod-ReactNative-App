// contexts/IntroContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { IntroStorageService } from '../services/IntroStorageService';

type IntroContextType = {
  isIntroCompleted: boolean;
  isLoading: boolean;
  completeIntro: () => Promise<void>;
  resetIntro: () => Promise<void>;
};

const IntroContext = createContext<IntroContextType | null>(null);

export const useIntro = () => {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error('useIntro must be used within an IntroProvider');
  }
  return context;
};

export const IntroProvider = ({ children }) => {
  const [isIntroCompleted, setIsIntroCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // بررسی وضعیت intro هنگام شروع اپلیکیشن
  useEffect(() => {
    const checkIntroStatus = async () => {
      try {
        const completed = await IntroStorageService.isIntroCompleted();
        setIsIntroCompleted(completed);
      } catch (error) {
        console.error('Error checking intro status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkIntroStatus();
  }, []);

  // علامت‌گذاری intro به عنوان کامل شده
  const completeIntro = async () => {
    try {
      await IntroStorageService.markIntroAsCompleted();
      setIsIntroCompleted(true);
    } catch (error) {
      console.error('Error completing intro:', error);
    }
  };

  // ریست کردن intro (برای تست)
  const resetIntro = async () => {
    try {
      await IntroStorageService.resetIntroStatus();
      setIsIntroCompleted(false);
    } catch (error) {
      console.error('Error resetting intro:', error);
    }
  };

  const value = {
    isIntroCompleted,
    isLoading,
    completeIntro,
    resetIntro,
  };

  return (
    <IntroContext.Provider value={value}>
      {children}
    </IntroContext.Provider>
  );
};