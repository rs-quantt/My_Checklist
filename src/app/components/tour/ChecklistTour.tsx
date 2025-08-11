'use client';

import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export const ChecklistTour = () => {
  const { data: session } = useSession();

  useEffect(() => {
    const isAdmin = session?.user?.role === 'admin';

    const steps: DriveStep[] = [
      {
        element: '#search-bar',
        popover: {
          title: 'Search for a Template',
          description:
            'Use this search bar to quickly find any checklist template by its title or description.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '.common-templates',
        popover: {
          title: 'Common Templates',
          description:
            'These are frequently used templates available for quick access. Click to view details.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '.all-templates',
        popover: {
          title: 'All Available Templates',
          description:
            'Browse through the complete list of specialized checklist templates here.',
          side: 'top',
          align: 'start',
        },
      },
    ];

    if (!isAdmin) {
      steps.splice(1, 0, {
        element: '#start-new-task-button',
        popover: {
          title: 'Start a New Task',
          description:
            'Click here to begin a new task by selecting a checklist template and filling it out.',
          side: 'bottom',
          align: 'center',
        },
      });
    }

    const driverObj = driver({
      showProgress: true,
      steps: steps,
      popoverClass: 'driverjs-theme',
      onDestroyed: () => {
        document.body.classList.remove('driver-active');
      },
    });

    const startTour = () => {
      const allElementsPresent = steps.every((step) => {
        if (!step.element) {
          return true;
        }
        if (typeof step.element === 'string') {
          return !!document.querySelector(step.element);
        }
        return true;
      });

      if (allElementsPresent) {
        document.body.classList.add('driver-active');
        driverObj.drive();
      } else {
        console.warn(
          'Could not start tour because some tour elements are not yet on the page.',
        );
      }
    };

    const tourButton = document.getElementById('start-tour-button');
    if (tourButton) {
      tourButton.addEventListener('click', startTour);
    }

    return () => {
      if (tourButton) {
        tourButton.removeEventListener('click', startTour);
      }
      // This is a more robust way to handle destruction
      if (driverObj && typeof driverObj.destroy === 'function') {
        driverObj.destroy();
      }
      document.body.classList.remove('driver-active');
    };
  }, [session]);

  return null;
};
