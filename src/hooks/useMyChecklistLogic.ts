import {
  MyCategorySummaryDetail,
  getMyCategorySummaryDetailById,
} from '@/services/categoryService';
import { getUserChecklistItemsByTaskCodeAndUserId } from '@/services/checklistService';
import { Category } from '@/types/category';
import { Checklist, ItemStateMap } from '@/types/checklist';
import { Status } from '@/types/enum';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export const useMyChecklistLogic = (categorySummaryId?: string) => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [checklistTemplates, setChecklistTemplates] = useState<Checklist[]>([]);
  const [currentChecklistIndex, setCurrentChecklistIndex] = useState<number>(0);
  const [displayedChecklist, setDisplayedChecklist] =
    useState<Checklist | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [taskCode, setTaskCode] = useState<string>('');
  const [taskCodeError, setTaskCodeError] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState<string>('');

  // State to hold ALL item states across all checklists within the selected category
  const [allChecklistsItemStates, setAllChecklistsItemStates] = useState<
    Record<string, ItemStateMap>
  >({});
  // State to hold expanded/collapsed status for items across all checklists
  const [allChecklistsExpandedStates, setAllChecklistsExpandedStates] =
    useState<Record<string, { [itemId: string]: boolean }>>({});

  // Derived state for the currently displayed checklist's items
  const currentChecklistItemStates = displayedChecklist
    ? allChecklistsItemStates[displayedChecklist._id] || {}
    : {};
  // Derived state for the currently displayed checklist's expanded items
  const currentExpandedItems = displayedChecklist
    ? allChecklistsExpandedStates[displayedChecklist._id] || {}
    : {};

  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [savedChecklistId, setSavedChecklistId] = useState<string | null>(null);

  const loggedInUserId = session?.user?.id;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setError(null);

        const categoriesRes = await fetch('/api/categories');

        if (!categoriesRes.ok) {
          throw new Error(
            `Failed to fetch categories: ${categoriesRes.status} ${categoriesRes.statusText}`,
          );
        }

        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);

        if (categorySummaryId && loggedInUserId) {
          const summaryData: MyCategorySummaryDetail | null =
            await getMyCategorySummaryDetailById(categorySummaryId);

          if (!summaryData) {
            throw new Error('Category summary not found.');
          }

          setTaskCode(summaryData.taskCode);
          setCommitMessage(summaryData.commitMessage || '');
          setSelectedCategory(summaryData.category);

          // Add null check for summaryData.category here
          if (!summaryData.category) {
            throw new Error('Category data missing from summary.');
          }

          // Fetch checklist templates for the category
          setIsTemplateLoading(true);

          const checklistRes = await fetch(
            `/api/category-checklists?categoryId=${summaryData.category._id}`,
          );
          if (!checklistRes.ok) {
            throw new Error(
              `Failed to fetch checklist templates: ${checklistRes.status} ${checklistRes.statusText}`,
            );
          }
          const checklistData: Checklist[] = await checklistRes.json();
          setChecklistTemplates(checklistData);

          if (checklistData.length > 0) {
            setDisplayedChecklist(checklistData[0]);

            // NEW: Fetch individual user checklist items for this taskCode

            const userChecklistItems =
              await getUserChecklistItemsByTaskCodeAndUserId(
                loggedInUserId,
                summaryData.taskCode,
              );

            const initialItemStates: Record<string, ItemStateMap> = {};
            const initialExpandedStates: Record<
              string,
              { [itemId: string]: boolean }
            > = {};

            // Initialize all items with empty status first
            checklistData.forEach((template) => {
              initialItemStates[template._id] = {};
              initialExpandedStates[template._id] = {};
              template.items.forEach((item) => {
                initialItemStates[template._id][item._id] = {
                  status: Status.EMPTY,
                  note: '',
                };
                // Do NOT set to true here. Items should start collapsed unless explicitly expanded by user interaction.
                initialExpandedStates[template._id][item._id] = false;
              });
            });

            // Then populate with existing data
            userChecklistItems.forEach((userItem) => {
              // Ensure userItem has checklistId before accessing it
              if (
                userItem.checklistId &&
                initialItemStates[userItem.checklistId] &&
                initialItemStates[userItem.checklistId][userItem.itemId]
              ) {
                initialItemStates[userItem.checklistId][userItem.itemId] = {
                  status: userItem.status,
                  note: userItem.note || '',
                };
              }
            });

            setAllChecklistsItemStates(initialItemStates);
            setAllChecklistsExpandedStates(initialExpandedStates);
          } else {
            setDisplayedChecklist(null);
          }
          setIsTemplateLoading(false);

          setInitialLoading(false); // Set initialLoading to false when done with categorySummaryId flow
        } else {
          // Standard flow: no categorySummaryId, just set initial loading to false
          setInitialLoading(false);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Could not load initial data. Please try again later.');
        setInitialLoading(false); // Ensure initialLoading is false on error
        setIsTemplateLoading(false); // Ensure isTemplateLoading is false on error
      } finally {
        // Ensure that initialLoading is set to false in all cases after fetchInitialData completes
        if (initialLoading) {
          // Only set if it hasn't been set to false already
          setInitialLoading(false);
        }
        if (isTemplateLoading) {
          // Only set if it hasn't been set to false already
          setIsTemplateLoading(false);
        }
      }
    };

    if (sessionStatus === 'authenticated') {
      fetchInitialData();
    } else if (sessionStatus === 'unauthenticated') {
      setInitialLoading(false);
    }
  }, [categorySummaryId, loggedInUserId, sessionStatus]);

  // Effect to initialize/load item states and expanded states when displayedChecklist changes
  useEffect(() => {
    if (displayedChecklist) {
      setAllChecklistsItemStates((prev) => {
        if (!prev[displayedChecklist._id]) {
          // Initialize if this checklist's state doesn't exist yet
          const initialStatesForCurrentChecklist: ItemStateMap = {};
          displayedChecklist.items.forEach((item) => {
            initialStatesForCurrentChecklist[item._id] = {
              status: Status.EMPTY,
              note: '',
            };
          });
          return {
            ...prev,
            [displayedChecklist._id]: initialStatesForCurrentChecklist,
          };
        }
        return prev; // Use existing states if already present
      });

      setAllChecklistsExpandedStates((prev) => {
        if (!prev[displayedChecklist._id]) {
          // Ensure all items are collapsed by default for any new checklist displayed
          const newExpandedStates: { [itemId: string]: boolean } = {};
          displayedChecklist.items.forEach((item) => {
            newExpandedStates[item._id] = false;
          });
          return { ...prev, [displayedChecklist._id]: newExpandedStates };
        }
        return prev; // Use existing expanded state if already present
      });
    }
  }, [displayedChecklist, categorySummaryId]);

  const handleCategoryChange = async (categoryId: string) => {
    if (categorySummaryId) {
      // Prevent changing category if editing an existing summary
      console.warn('Cannot change category when editing an existing summary.');
      return;
    }

    if (!categoryId) {
      setSelectedCategory(null);
      setChecklistTemplates([]);
      setDisplayedChecklist(null);
      setCurrentChecklistIndex(0);
      setAllChecklistsItemStates({}); // Clear all saved states for all checklists
      setAllChecklistsExpandedStates({}); // Clear all expanded states
      return;
    }

    const category = categories.find((c) => c._id === categoryId);
    setSelectedCategory(category || null);
    setCurrentChecklistIndex(0);
    setDisplayedChecklist(null); // Will trigger useEffect to reset states for new checklist
    setAllChecklistsItemStates({}); // Clear all saved states for all checklists
    setAllChecklistsExpandedStates({}); // Clear all expanded states

    setIsTemplateLoading(true);

    try {
      const checklistRes = await fetch(
        `/api/category-checklists?categoryId=${categoryId}`,
      );
      if (!checklistRes.ok) {
        throw new Error(
          `Failed to fetch checklist templates for category: ${checklistRes.status} ${checklistRes.statusText}`,
        );
      }
      const checklistData = await checklistRes.json();
      setChecklistTemplates(checklistData);

      if (checklistData.length > 0) {
        setDisplayedChecklist(checklistData[0]);
      } else {
        setDisplayedChecklist(null);
      }
    } catch (err) {
      console.error('Error fetching checklists for category:', err);
      setError('Could not load checklists for the selected category.');
      setChecklistTemplates([]);
      setDisplayedChecklist(null);
    } finally {
      setIsTemplateLoading(false);
    }
  };

  // Helper to validate a single checklist's items based on its specific itemStates
  const validateChecklistItems = useCallback(
    (checklist: Checklist) => {
      const errors: string[] = [];
      const statesForThisChecklist =
        allChecklistsItemStates[checklist._id] || {};
      checklist.items.forEach((item) => {
        const state = statesForThisChecklist[item._id];
        if (!state || state.status === Status.EMPTY) {
          errors.push(`Item "${item.label}" status has not been selected.`);
        }
        if (
          (state?.status === Status.INCOMPLETE ||
            state?.status === Status.NA) &&
          !state?.note?.trim()
        ) {
          errors.push(`Item "${item.label}" requires a note.`);
        }
      });
      return errors;
    },
    [allChecklistsItemStates],
  );

  const validateTaskCode = (code: string): string | null => {
    const trimmedCode = code.trim();
    if (trimmedCode.length === 0) {
      return null; // Don't show error if field is empty (will be handled by required attribute)
    }
    if (trimmedCode.length < 3) {
      return 'Task Code must be at least 3 characters long.';
    }
    if (!/^[a-zA-Z0-9]*$/.test(trimmedCode)) {
      return 'Task Code can only contain numbers and letters.';
    }
    return null; // No error
  };

  const handleSetTaskCode = (value: string) => {
    setTaskCode(value);
    // Do NOT set taskCodeError here. It should only be set on blur.
  };

  const handleTaskCodeBlur = () => {
    const trimmedValue = taskCode.trim().toUpperCase();
    setTaskCode(trimmedValue);
    const error = validateTaskCode(trimmedValue);
    setTaskCodeError(error);
  };

  const handleChecklistNavigation = (direction: 'next' | 'previous') => {
    if (!displayedChecklist) return;

    // Validate the current checklist BEFORE navigating to the next one
    if (direction === 'next') {
      const errors = validateChecklistItems(displayedChecklist);
      if (errors.length > 0) {
        setError(
          `Please complete the current checklist before proceeding:\n` +
            errors.join('\n'),
        );
        return;
      }
    }
    setError(null); // Clear previous error if validation passes

    let newIndex = currentChecklistIndex;
    if (direction === 'next') {
      newIndex = currentChecklistIndex + 1;
    } else if (direction === 'previous') {
      newIndex = currentChecklistIndex - 1;
    }

    if (newIndex >= 0 && newIndex < checklistTemplates.length) {
      setCurrentChecklistIndex(newIndex);
      setDisplayedChecklist(checklistTemplates[newIndex]);
      window.scrollTo(0, 0);
    } else {
      console.warn('Attempted to navigate out of bounds.');
    }
  };

  const saveAllChecklists = async () => {
    if (!loggedInUserId || !selectedCategory) return;

    // Perform final task code validation before saving all checklists
    const finalTaskCodeError = validateTaskCode(taskCode);
    if (finalTaskCodeError) {
      setTaskCodeError(finalTaskCodeError);
      setError('Please correct the Task Code before saving.');
      return;
    }

    setIsSaving(true);
    let hasOverallError = false;
    let savedAnyChecklist = false;
    let lastSavedId: string | null = null;

    for (const template of checklistTemplates) {
      // Validate each template using its specific states from allChecklistsItemStates
      const validationErrors = validateChecklistItems(template);
      if (validationErrors.length > 0) {
        setError(
          `Validation errors for checklist "${template.title}":\n` +
            validationErrors.join('\n'),
        );
        hasOverallError = true;
        break;
      }

      const itemsToSave = template.items.filter(
        (item) =>
          allChecklistsItemStates[template._id]?.[item._id]?.status !==
          Status.EMPTY,
      );

      if (itemsToSave.length === 0) {
        continue;
      }

      const payload = {
        userId: loggedInUserId,
        taskCode: taskCode.trim().toUpperCase(), // Ensure taskCode is trimmed and uppercased for saving
        commitMessage,
        checklistId: template._id,
        categoryId: selectedCategory._id,
        items: itemsToSave.map((item) => ({
          itemId: item._id,
          status:
            allChecklistsItemStates[template._id]?.[item._id]?.status ||
            Status.EMPTY,
          note: allChecklistsItemStates[template._id]?.[item._id]?.note || '',
        })),
      };

      try {
        const res = await fetch('/api/my-checklists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(
            `Save failed for checklist "${template.title}": ` +
              (await res.text()),
          );
        }
        const { summaryId } = await res.json();
        lastSavedId = summaryId;
        savedAnyChecklist = true;
      } catch (error) {
        console.error(error);
        setError(
          `An error occurred while saving checklist "${template.title}". Please try again.`,
        );
        hasOverallError = true;
        break;
      }
    }

    setIsSaving(false);

    if (!hasOverallError && savedAnyChecklist) {
      setSavedChecklistId(lastSavedId);
      setShowSuccessPopup(true);
      setError(null); // Clear overall error on success
      window.scrollTo(0, 0);
    } else if (!savedAnyChecklist && !hasOverallError) {
      setError(
        'No checklist items were marked for saving across all checklists.',
      );
    }
  };

  useEffect(() => {
    // Only check for taskCodeError if taskCode is not empty and not in edit mode
    const isTaskCodeInvalid =
      !categorySummaryId && taskCode.trim() !== '' && taskCodeError !== null;

    if (
      !loggedInUserId ||
      isTaskCodeInvalid ||
      !selectedCategory ||
      !displayedChecklist
    ) {
      setIsSaveButtonDisabled(true);
      return;
    }

    const currentChecklistErrors = validateChecklistItems(displayedChecklist);
    setIsSaveButtonDisabled(currentChecklistErrors.length > 0);
  }, [
    loggedInUserId,
    taskCode,
    taskCodeError,
    selectedCategory,
    displayedChecklist,
    validateChecklistItems,
    categorySummaryId, // Add categorySummaryId to dependencies
  ]);

  const resetForm = () => {
    setSelectedCategory(null);
    setChecklistTemplates([]);
    setCurrentChecklistIndex(0);
    setDisplayedChecklist(null);
    setTaskCode('');
    setTaskCodeError(null);
    setCommitMessage('');
    setAllChecklistsItemStates({}); // Full form reset
    setAllChecklistsExpandedStates({}); // Full form reset
    setError(null);
  };

  // Update currentChecklistItemStates via allChecklistsItemStates
  const handleStatusChange = (itemId: string, status: Status) => {
    if (!displayedChecklist) return;
    setAllChecklistsItemStates((prev) => ({
      ...prev,
      [displayedChecklist._id]: {
        ...prev[displayedChecklist._id],
        [itemId]: { ...prev[displayedChecklist._id]?.[itemId], status },
      },
    }));
  };

  // Update currentExpandedItems via allChecklistsExpandedStates
  const toggleItem = (itemId: string) => {
    if (!displayedChecklist) return;
    setAllChecklistsExpandedStates((prev) => ({
      ...prev,
      [displayedChecklist._id]: {
        ...prev[displayedChecklist._id],
        [itemId]: !prev[displayedChecklist._id]?.[itemId],
      },
    }));
  };

  // Update currentChecklistItemStates via allChecklistsItemStates
  const handleNoteChange = (itemId: string, note: string) => {
    if (!displayedChecklist) return;
    setAllChecklistsItemStates((prev) => ({
      ...prev,
      [displayedChecklist._id]: {
        ...prev[displayedChecklist._id],
        [itemId]: { ...prev[displayedChecklist._id]?.[itemId], note },
      },
    }));
  };

  return {
    session,
    sessionStatus,
    router,
    categories,
    selectedCategory,
    checklistTemplates,
    currentChecklistIndex,
    displayedChecklist,
    isTemplateLoading,
    taskCode,
    setTaskCode: handleSetTaskCode, // Use the new handler
    taskCodeError,
    commitMessage,
    setCommitMessage,
    itemStates: currentChecklistItemStates, // Expose current checklist's states to component
    expandedItems: currentExpandedItems, // Expose current checklist's expanded states to component
    isSaveButtonDisabled,
    isSaving,
    showSuccessPopup,
    setShowSuccessPopup,
    error,
    initialLoading,
    savedChecklistId,
    loggedInUserId,
    handleCategoryChange,
    handleChecklistNavigation,
    saveAllChecklists,
    resetForm,
    handleStatusChange,
    toggleItem,
    handleNoteChange,
    handleTaskCodeBlur,
  };
};
