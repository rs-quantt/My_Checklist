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
  const startTour = () => {
    driver({
      showProgress: true,
      steps: [
        {
          element: '#template-select-container',
          popover: {
            title: 'Select a Template',
            description: 'First, choose a checklist template from this list.',
          },
        },
        {
          element: '#developer-select-container',
          popover: {
            title: 'Assign a Developer',
            description:
              'Next, select the developer responsible for this task.',
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
      ],
    }).drive();
  };

  useEffect(() => {
    const activeDriver = driver();
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
      activeDriver.destroy();
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

    const itemRow = element.closest('li.relative');
    const content = itemRow?.querySelector('div.overflow-hidden');
    const isCollapsed = !content || getComputedStyle(content).height === '0px';

    if (isCollapsed) {
      const trigger = itemRow?.querySelector<HTMLElement>('.cursor-pointer');
      if (trigger) trigger.click();
    }
  };

  useEffect(() => {
    const activeDriver = driver();
    const observer: MutationObserver = onElementReady(
      'start-checklist-items-tour-button',
      (tourButton) => {
        tourButton.addEventListener('click', startTour);
      },
    );

    const startTour = () => {
      driver({
        showProgress: true,
        steps: [
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
        ],
      });
      activeDriver.drive();
    };

    return () => {
      observer.disconnect();
      const tourButton = document.getElementById(
        'start-checklist-items-tour-button',
      );
      tourButton?.removeEventListener('click', startTour);
      activeDriver.destroy();
    };
  }, []);

  return null;
};
