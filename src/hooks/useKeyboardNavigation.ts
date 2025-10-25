import { useEffect, useRef } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const useKeyboardNavigation = () => {
  const { accessibility } = useAccessibility();
  const focusableElements = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!accessibility.keyboardNav) return;

    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[role="button"]:not([disabled])'
      ].join(', ');
      
      return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    };

    const updateFocusableElements = () => {
      focusableElements.current = getFocusableElements();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!accessibility.keyboardNav) return;

      const { key, shiftKey, target } = event;
      const currentElement = target as HTMLElement;
      
      updateFocusableElements();
      const elements = focusableElements.current;
      const currentIndex = elements.indexOf(currentElement);

      switch (key) {
        case 'Tab':
          if (shiftKey && currentIndex > 0) {
            event.preventDefault();
            elements[currentIndex - 1].focus();
          } else if (!shiftKey && currentIndex < elements.length - 1) {
            event.preventDefault();
            elements[currentIndex + 1].focus();
          }
          break;

        case 'Enter':
        case ' ':
          if (currentElement.tagName === 'BUTTON' || 
              currentElement.getAttribute('role') === 'button' ||
              currentElement.closest('button') ||
              currentElement.closest('[role="button"]')) {
            event.preventDefault();
            currentElement.click();
          }
          break;

        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex < elements.length - 1) {
            elements[currentIndex + 1].focus();
          } else {
            elements[0]?.focus(); 
          }
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex > 0) {
            elements[currentIndex - 1].focus();
          } else {
            elements[elements.length - 1]?.focus();
          }
          break;

        case 'Escape':
          const openMenus = document.querySelectorAll('[aria-expanded="true"]');
          openMenus.forEach(menu => {
            if (menu instanceof HTMLElement) {
              menu.click();
            }
          });
          break;
      }
    };

    updateFocusableElements();

    document.documentElement.classList.add('keyboard-nav-active');

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.documentElement.classList.remove('keyboard-nav-active');
    };
  }, [accessibility.keyboardNav]);

  return { keyboardNavEnabled: accessibility.keyboardNav };
};