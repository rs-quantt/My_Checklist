'use client';

import { useEffect } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * A helper function to safely find an element and attach a listener.
 * It uses a MutationObserver to wait for the element to appear.
 */
function onElementReady(
  elementId: string,
  callback: (element: HTMLElement) => void,
) {
  const observer = new MutationObserver((mutationsList, observer) => {
    const element = document.getElementById(elementId);
    if (element) {
      callback(element);
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Fallback in case the element is already there
  const element = document.getElementById(elementId);
  if (element) {
    callback(element);
    observer.disconnect();
  }

  // Return the observer so it can be disconnected on cleanup
  return observer;
}

/**
 * Tour for the initial page controls before a template is selected.
 */
export const InitialTour = () => {
  useEffect(() => {
    const steps: DriveStep[] = [
      {
        element: '#template-select-container',
        popover: {
          title: 'Select a Template',
          description: 'First, choose a checklist template from this list.',
        },
      },
      {
        element: '#task-code-input-container',
        popover: {
          title: 'Enter Task Code',
          description:
            'Enter the unique code for the task to link your work.',
        },
      },
    ];

    const driverObj = driver({
      showProgress: true,
      steps: steps,
    });

    const startTour = () => {
      const allElementsPresent = steps.every((step) => {
        if (!step.element) return true;
        if (typeof step.element === 'string') {
          return !!document.querySelector(step.element);
        }
        return true;
      });

      if (allElementsPresent) {
        driverObj.drive();
      } else {
        console.warn(
          'Could not start tour because some tour elements are not yet on the page.',
        );
      }
    };

    const observer: MutationObserver = onElementReady(
      'start-my-checklist-tour-button',
      (tourButton) => {
        tourButton.addEventListener('click', startTour);
      },
    );

    return () => {
      observer.disconnect();
      const tourButton = document.getElementById(
        'start-my-checklist-tour-button',
      );
      tourButton?.removeEventListener('click', startTour);
      driverObj.destroy();
    };
  }, []);

  return null;
};

/**
 * Tour for the checklist items that appear after a template is selected.
 */
export const ChecklistItemsTour = () => {
  const expandChecklistItemIfNeeded = (element: Element | undefined) => {
    if (!(element instanceof HTMLElement)) return;

    // Find the parent list item, which has the 'my-checklist-item' class
    const itemRow = element.closest('.my-checklist-item') || element;
    if (!itemRow) return;

    // Find the content area within the item.
    const content = itemRow.querySelector<HTMLElement>('div.overflow-hidden');

    // An item is collapsed if its content area is not present in the DOM.
    if (!content) {
      // Find the clickable header to expand the item.
      const trigger = itemRow.querySelector<HTMLElement>('.cursor-pointer');
      if (trigger) {
        trigger.click();
      }
    }
  };

  useEffect(() => {
    const steps: DriveStep[] = [
      {
        element: '.my-checklist-item',
        popover: {
          title: 'Checklist Item',
          description:
            'This is one item in the checklist. It has been expanded to show its details.',
        },
        onHighlightStarted: expandChecklistItemIfNeeded,
      },
      {
        element: '.my-checklist-status-buttons',
        popover: {
          title: 'Set Status',
          description:
            'After reviewing, set its status: Done, Incomplete, or N/A.',
        },
        onHighlightStarted: expandChecklistItemIfNeeded,
      },
      {
        element: '.my-checklist-note-input',
        popover: {
          title: 'Add a Note',
          description:
            'For "Incomplete" or "N/A" statuses, a note is required to explain why.',
        },
        onHighlightStarted: expandChecklistItemIfNeeded,
      },
      {
        element: '#save-checklist-button',
        popover: {
          title: 'Save the Checklist',
          description:
            'Once all items are filled out, click here to save the entire checklist.',
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
      // The tour can only start if the first element is on the page.
      // Other elements might be hidden inside the collapsed item initially.
      if (steps.length > 0 && steps[0].element) {
        const firstElement = document.querySelector(steps[0].element as string);
        if (firstElement) {
          driverObj.drive();
        } else {
           console.warn(
            'Could not start tour because the initial tour element is not yet on the page.',
          );
        }
      }
    };
    
    const observer: MutationObserver = onElementReady(
      'start-checklist-items-tour-button',
      (tourButton) => {
        tourButton.addEventListener('click', startTour);
      },
    );

    return () => {
      observer.disconnect();
      const tourButton = document.getElementById(
        'start-checklist-items-tour-button',
      );
      tourButton?.removeEventListener('click', startTour);
      driverObj.destroy();
    };
  }, []);

  return null;
};
