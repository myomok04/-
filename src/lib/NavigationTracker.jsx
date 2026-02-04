import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
export default function NavigationTracker() {
  const location = useLocation();
  useEffect(() => { console.log(`이동: ${location.pathname}`); }, [location]);
  return null;
}