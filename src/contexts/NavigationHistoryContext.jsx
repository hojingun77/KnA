import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationHistoryContext = createContext(null);

export function NavigationHistoryProvider({ children }) {
  const location = useLocation();
  const [direction, setDirection] = useState('none');
  const previousIndexRef = useRef(window.history.state?.idx ?? 0);

  useEffect(() => {
    const currentIndex = window.history.state?.idx ?? 0;
    const previousIndex = previousIndexRef.current;
    
    // Detect direction based on index change
    if (currentIndex > previousIndex) {
      setDirection('push');
    } else if (currentIndex < previousIndex) {
      setDirection('pop');
    } else {
      setDirection('none');
    }
    
    // Update ref for next comparison
    previousIndexRef.current = currentIndex;
  }, [location.pathname]);

  return (
    <NavigationHistoryContext.Provider value={{ direction }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext);
  if (!context) {
    throw new Error('useNavigationHistory must be used within NavigationHistoryProvider');
  }
  return context;
}
