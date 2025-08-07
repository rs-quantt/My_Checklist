'use client';

import { useEffect } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Tour for the initial page controls before a template is selected.
 */
export const InitialTour = () => {
  useEffect(() => {
    let activeDriver = driver();

    const initialSteps: DriveStep[] = [
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
          description: 'Next, select the developer responsible for this task.',
        },
      },
      {
        element: '#task-code-input-container',
        popover: {
          title: 'Enter Task Code',
          description: 'Enter the unique code for the task to link your work.',
        },
      },
    ];

    const startTour = () => {
      activeDriver = driver({
        showProgress: true,
        steps: initialSteps,
      });
      activeDriver.drive();
    };

    const tourButton = document.getElementById('start-my-checklist-tour-button');
    tourButton?.addEventListener('click', startTour);

    return () => {
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
  useEffect(() => {
    let activeDriver = driver();

    const expandChecklistItemIfNeeded = (element: Element | undefined) => {
      if (!(element instanceof HTMLElement)) return;
      
      // The element is the `li` with `.my-checklist-item`
      const itemRow = element; 
      const content = itemRow.querySelector('div.overflow-hidden');
      // Framer motion removes the content div, so we check for its existence
      const isCollapsed = !content;
      
      if (isCollapsed) {
        const trigger = itemRow.querySelector<HTMLElement>('.cursor-pointer');
        if (trigger) trigger.click();
      }
    };

    const checklistSteps: DriveStep[] = [
      {
        element: '.my-checklist-item',
        popover: {
          title: 'Checklist Item',
          description: "This is one item in the checklist. It has been expanded to show its details.",
        },
        onHighlightStarted: expandChecklistItemIfNeeded,
      },
      {
        element: '.my-checklist-status-buttons',
        popover: {
          title: 'Set Status',
          description: 'After reviewing, set its status: OK, Not OK, or N/A.',
        },
        onHighlightStarted: expandChecklistItemIfNeeded,
      },
      {
        element: '.my-checklist-note-input',
        popover: {
          title: 'Add a Note',
          description: 'For "Not OK" or "N/A" statuses, a note is required to explain why.',
        },
        onHighlightStarted: expandChecklistItemIfNeeded,
      },
      {
        element: '#save-checklist-button',
        popover: {
          title: 'Save the Checklist',
          description: 'Once all items are filled out, click here to save the entire checklist.',
          side: 'top',
          align: 'start',
        },
      },
    ];

    const startTour = () => {
      activeDriver = driver({
        showProgress: true,
        steps: checklistSteps,
      });
      activeDriver.drive();
    };

    const tourButton = document.getElementById('start-checklist-items-tour-button');
    tourButton?.addEventListener('click', startTour);

    return () => {
      tourButton?.removeEventListener('click', startTour);
      activeDriver.destroy();
    };
  }, []);
  
  return null;
};
