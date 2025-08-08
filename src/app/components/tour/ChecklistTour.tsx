'use client';

import { useEffect } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export const ChecklistTour = () => {
  useEffect(() => {
    const steps: DriveStep[] = [
      {
        element: '#search-bar',
        popover: {
          title: 'Search for a Template',
          description:
            'Use this search bar to quickly find any checklist template by its title.',
        },
      },
      {
        element: '#start-new-task-button',
        popover: {
          title: 'Start a New Task',
          description:
            'This is the main action. Click here to choose a template and begin filling out your checklist for a new task.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '.checklist-card',
        popover: {
          title: 'View Template Details',
          description:
            'Click on any card to see a read-only view of the checklist items and details.',
        },
      },
    ];

    const driverObj = driver({
      showProgress: true,
      steps: steps,
    });

    const startTour = () => {
      const allElementsPresent = steps.every((step) =>
        document.querySelector(step.element as string),
      );
      if (allElementsPresent) {
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
      // Safely destroy the driver instance
      if (driverObj) {
        driverObj.destroy();
      }
    };
  }, []);

  return null;
};
