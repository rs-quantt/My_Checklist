'use client';

import { useEffect } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export const ChecklistTour = () => {
  useEffect(() => {
    // Define steps array outside
    const steps: DriveStep[] = [
      {
        element: '#search-bar',
        popover: {
          title: 'Search Checklists',
          description: 'Use this bar to quickly find checklists by their title or description.',
        },
      },
      {
        element: '.checklist-card',
        popover: {
          title: 'Checklist Card',
          description: 'Each card represents a checklist. You can see its title, description, type, and the number of items.',
        },
      },
      {
        element: '.checklist-type-tag',
        popover: {
          title: 'Checklist Type',
          description: 'This tag shows the category of the checklist, like "Coding Rule" or "Test Case".',
        },
      },
      {
        element: '.checklist-card',
        popover: {
          title: 'View Details',
          description: 'Click on any card to view its details and start working on it.',
        },
      },
    ];
    
    const driverObj = driver({
      showProgress: true,
      steps: steps, // Pass the steps array here
    });

    const startTour = () => {
      // Check if all elements are present before starting
      const allElementsPresent = steps.every(step => document.querySelector(step.element as string));
       if (allElementsPresent) {
        driverObj.drive();
      } else {
        console.warn("Could not start tour because some tour elements are not yet on the page.");
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
    };
  }, []);

  return null; // This component does not render anything itself
};
