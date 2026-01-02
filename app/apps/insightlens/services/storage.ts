
import { LibraryItem, TransformationResult, LensType } from '../types';

const STORAGE_KEY = 'insight_lens_library';

export const saveToLibrary = (result: TransformationResult, inputTitle: string): LibraryItem | null => {
  try {
    const items = getLibraryItems();
    
    const newItem: LibraryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      lens: result.type,
      title: inputTitle.length > 40 ? inputTitle.substring(0, 40) + '...' : inputTitle,
      result: result
    };

    // Optimistic approach: Try to save
    items.unshift(newItem); 
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return newItem;
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
        // Storage full. Try to remove the oldest item and retry once
        if (items.length > 1) {
           items.pop(); // Remove oldest
           items.shift(); // Remove the new item we just added to re-add it
           items.unshift(newItem);
           try {
             localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
             return newItem;
           } catch (retryError) {
             alert("Storage is full. Please delete old items from the Library to save new ones.");
             return null;
           }
        } else {
           alert("Storage is full. Cannot save this item (it might be too large).");
           return null;
        }
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error("Failed to save to library:", error);
    return null;
  }
};

export const getLibraryItems = (): LibraryItem[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const deleteLibraryItem = (id: string): LibraryItem[] => {
  const items = getLibraryItems().filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
};

export const clearLibrary = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const groupItemsByCategory = (items: LibraryItem[]): Record<string, LibraryItem[]> => {
  return items.reduce((groups, item) => {
    const category = item.lens;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, LibraryItem[]>);
};
