import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Checklist, ItemStateMap } from '@/types/checklist';
import { Status } from '@/types/enum';
import { Category } from '@/types/category';

export const useMyChecklistLogic = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [checklistTemplates, setChecklistTemplates] = useState<Checklist[]>([]);
  const [currentChecklistIndex, setCurrentChecklistIndex] = useState<number>(0);
  const [displayedChecklist, setDisplayedChecklist] = useState<Checklist | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [taskCode, setTaskCode] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState<string>('');
  
  // State to hold ALL item states across all checklists within the selected category
  const [allChecklistsItemStates, setAllChecklistsItemStates] = useState<Record<string, ItemStateMap>>({});
  // State to hold expanded/collapsed status for items across all checklists
  const [allChecklistsExpandedStates, setAllChecklistsExpandedStates] = useState<Record<string, { [itemId: string]: boolean; }>>({});

  // Derived state for the currently displayed checklist's items
  const currentChecklistItemStates = displayedChecklist ? allChecklistsItemStates[displayedChecklist._id] || {} : {};
  // Derived state for the currently displayed checklist's expanded items
  const currentExpandedItems = displayedChecklist ? allChecklistsExpandedStates[displayedChecklist._id] || {} : {};

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
          throw new Error(`Failed to fetch categories: ${categoriesRes.status} ${categoriesRes.statusText}`);
        }

        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Could not load initial data. Please try again later.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Effect to initialize/load item states and expanded states when displayedChecklist changes
  useEffect(() => {
    if (displayedChecklist) {
      setAllChecklistsItemStates(prev => {
        if (!prev[displayedChecklist._id]) {
          // Initialize if this checklist's state doesn't exist yet
          const initialStatesForCurrentChecklist: ItemStateMap = {};
          displayedChecklist.items.forEach(item => {
            initialStatesForCurrentChecklist[item._id] = { status: Status.EMPTY, note: '' };
          });
          return { ...prev, [displayedChecklist._id]: initialStatesForCurrentChecklist };
        }
        return prev; // Use existing states if already present
      });

      setAllChecklistsExpandedStates(prev => {
        if (!prev[displayedChecklist._id]) {
          return { ...prev, [displayedChecklist._id]: {} }; // Initialize expanded state for this checklist
        }
        return prev; // Use existing expanded state if already present
      });
    }
  }, [displayedChecklist]);


  const handleCategoryChange = async (categoryId: string) => {
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
      const checklistRes = await fetch(`/api/category-checklists?categoryId=${categoryId}`);
      if (!checklistRes.ok) {
        throw new Error(`Failed to fetch checklist templates for category: ${checklistRes.status} ${checklistRes.statusText}`);
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
  const validateChecklistItems = useCallback((checklist: Checklist) => {
    const errors: string[] = [];
    const statesForThisChecklist = allChecklistsItemStates[checklist._id] || {};
    checklist.items.forEach((item) => {
      const state = statesForThisChecklist[item._id];
      if (!state || state.status === Status.EMPTY) {
        errors.push(`Item "${item.label}" status has not been selected.`);
      }
      if (
        (state?.status === Status.INCOMPLETE || state?.status === Status.NA) &&
        !state?.note?.trim()
      ) {
        errors.push(`Item "${item.label}" requires a note.`);
      }
    });
    return errors;
  }, [allChecklistsItemStates]);

  const handleChecklistNavigation = () => {
    if (!displayedChecklist) return;

    // Validate the current checklist BEFORE navigating
    const errors = validateChecklistItems(displayedChecklist);
    if (errors.length > 0) {
      alert(`Please complete the current checklist before proceeding:\n` + errors.join('\n'));
      return;
    }

    const nextIndex = currentChecklistIndex + 1;
    if (nextIndex < checklistTemplates.length) {
      setCurrentChecklistIndex(nextIndex);
      setDisplayedChecklist(checklistTemplates[nextIndex]); // This will trigger the useEffect to load/initialize states
      window.scrollTo(0, 0);
    } else {
      console.warn("Attempted to navigate past last checklist.");
    }
  };

  const saveAllChecklists = async () => {
    if (!loggedInUserId || !selectedCategory) return;

    setIsSaving(true);
    let hasOverallError = false;
    let savedAnyChecklist = false;
    let lastSavedId: string | null = null;

    for (const template of checklistTemplates) {
      // Validate each template using its specific states from allChecklistsItemStates
      const validationErrors = validateChecklistItems(template);
      if (validationErrors.length > 0) {
        alert(`Validation errors for checklist "${template.title}":\n` + validationErrors.join('\n'));
        hasOverallError = true;
        break;
      }

      const itemsToSave = template.items.filter(item => allChecklistsItemStates[template._id]?.[item._id]?.status !== Status.EMPTY);

      if (itemsToSave.length === 0) {
        continue;
      }

      const payload = {
        userId: loggedInUserId,
        taskCode,
        commitMessage,
        checklistId: template._id,
        categoryId: selectedCategory._id,
        items: itemsToSave.map(item => ({
          itemId: item._id,
          status: allChecklistsItemStates[template._id]?.[item._id]?.status || Status.EMPTY,
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
          throw new Error(`Save failed for checklist "${template.title}": ` + (await res.text()));
        }
        const { summaryId } = await res.json();
        lastSavedId = summaryId;
        savedAnyChecklist = true;
      } catch (error) {
        console.error(error);
        alert(`An error occurred while saving checklist "${template.title}". Please try again.`);
        hasOverallError = true;
        break;
      }
    }

    setIsSaving(false);

    if (!hasOverallError && savedAnyChecklist) {
      setSavedChecklistId(lastSavedId);
      setShowSuccessPopup(true);
      window.scrollTo(0, 0);
    } else if (!savedAnyChecklist && !hasOverallError) {
      alert("No checklist items were marked for saving across all checklists.");
    }
  };

  useEffect(() => {
    if (!loggedInUserId || !taskCode || !selectedCategory || !displayedChecklist) {
      setIsSaveButtonDisabled(true);
      return;
    }

    const currentChecklistErrors = validateChecklistItems(displayedChecklist);
    setIsSaveButtonDisabled(currentChecklistErrors.length > 0);
  }, [loggedInUserId, taskCode, selectedCategory, displayedChecklist, validateChecklistItems]);

  const resetForm = () => {
    setSelectedCategory(null);
    setChecklistTemplates([]);
    setCurrentChecklistIndex(0);
    setDisplayedChecklist(null);
    setTaskCode('');
    setCommitMessage('');
    setAllChecklistsItemStates({}); // Full form reset
    setAllChecklistsExpandedStates({}); // Full form reset
    setError(null);
  };

  // Update currentChecklistItemStates via allChecklistsItemStates
  const handleStatusChange = (itemId: string, status: Status) => {
    if (!displayedChecklist) return;
    setAllChecklistsItemStates(prev => ({
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
    setAllChecklistsExpandedStates(prev => ({
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
    setAllChecklistsItemStates(prev => ({
      ...prev,
      [displayedChecklist._id]: {
        ...prev[displayedChecklist._id],
        [itemId]: { ...prev[displayedChecklist._id]?.[itemId], note },
      },
    }));
  };

  const handleTaskCodeBlur = () => {
    setTaskCode((prev) => prev.toUpperCase());
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
    setTaskCode,
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
