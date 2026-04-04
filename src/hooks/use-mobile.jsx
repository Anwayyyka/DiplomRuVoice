import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Хук для определения мобильного устройства.
 * @returns {boolean} true, если ширина экрана меньше MOBILE_BREAKPOINT
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const handleChange = (e) => {
      setIsMobile(e.matches);
    };

    mql.addEventListener('change', handleChange);
    setIsMobile(mql.matches); // обновляем на случай изменения до подписки

    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}