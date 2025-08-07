'use client';

import { useEffect } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export const ChecklistDetailTour = () => {
  useEffect(() => {
    // This hook accepts a generic `Element`.
    const expandChecklistItemIfNeeded = (element: Element | undefined) => {
      // We must check if it's an HTMLElement before using HTMLElement-specific properties/methods.
      if (!(element instanceof HTMLElement)) {
        return;
      }
      
      // Now `element` is safely typed as HTMLElement.
      const itemRow = element.closest('.checklist-item-row');
      if (itemRow) {
        const collapsibleContent = itemRow.querySelector<HTMLElement>('.overflow-hidden.transition-max-height');
        
        // Check if the area is collapsed (has max-height of 0)
        const isCollapsed = collapsibleContent && collapsibleContent.classList.contains('max-h-0');
        
        if (isCollapsed) {
          // Find the trigger element (the clickable header)
          const trigger = itemRow.querySelector<HTMLElement>('.cursor-pointer');
          if (trigger) {
            trigger.click();
          }
        }
      }
    };

    const steps: DriveStep[] = [
      {
        element: '#task-code-input',
        popover: {
          title: 'Task Code',
          description: 'Enter your unique task code here. This ensures your progress is saved correctly for this specific task.',
        },
      },
      {
        element: '.checklist-item-row',
        popover: {
          title: 'Checklist Item',
          description: 'This is an individual item you need to check. Read the label and description carefully.',
        },
      },
      {
        element: '.status-buttons',
        popover: {
          title: 'Status Buttons',
          description: 'Select the status for the item: OK (passed), NG (failed), or N/A (not applicable).',
        },
        onHighlightStarted: expandChecklistItemIfNeeded,
      },
      {
        element: '.note-input',
        popover: {
          title: 'Notes',
          description: 'You can add specific notes or comments for each item here.',
        },
        onHighlightStarted: expandChecklistItemIfNeeded,
      },
      {
        element: '#save-progress-button',
        popover: {
          title: 'Save Your Progress',
          description: 'After checking all items, click here to save your work.',
          side: 'top',
          align: 'start',
        },
      },
    ];

    const driverObj = driver({
      showProgress: true,
      steps: steps,
    });

    const startTour = () => {
      const allElementsPresent = steps.every(step => document.querySelector(step.element as string));
      if (allElementsPresent) {
        driverObj.drive();
      } else {
        console.warn("Could not start tour because some tour elements are not yet on the page.");
      }
    };

    const tourButton = document.getElementById('start-detail-tour-button');
    if (tourButton) {
      tourButton.addEventListener('click', startTour);
    }

    return () => {
      if (tourButton) {
        tourButton.removeEventListener('click', startTour);
      }
      driverObj.destroy();
    };
  }, []);

  return null;
};
