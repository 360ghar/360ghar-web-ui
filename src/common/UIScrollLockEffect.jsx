import { useEffect } from 'react';
import { useUIStore } from '../store';

function removeScrollLockClasses() {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.classList.remove('scroll-hide-sm');
  document.body.classList.remove('scroll-hide');
}

const UIScrollLockEffect = () => {
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);
  const offCanvas = useUIStore((state) => state.offCanvas);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    removeScrollLockClasses();

    if (offCanvas) {
      document.body.classList.add('scroll-hide');
    } else if (toggleMobileMenu) {
      document.body.classList.add('scroll-hide-sm');
    }

    return () => {
      removeScrollLockClasses();
    };
  }, [offCanvas, toggleMobileMenu]);

  return null;
};

export default UIScrollLockEffect;
