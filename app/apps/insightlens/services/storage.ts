
import { LibraryItem, TransformationResult, LensType } from '../types';
import { saveSession, listSessions, deleteSession } from '@/lib/session-client';
import type { Session as SupabaseSession } from '@/lib/session-service';

const STORAGE_KEY = 'insight_lens_library';

// Session ID map: localId -> supabaseId
let sessionIdMap = new Map<string, string>();

export const saveToLibrary = async (result: TransformationResult, inputTitle: string): Promise<{ item: LibraryItem; supabaseId: string } | null> => {
  try {
    const localId = crypto.randomUUID();
    const timestamp = Date.now();

    const newItem: LibraryItem = {
      id: localId,
      timestamp: timestamp,
      lens: result.type,
      title: inputTitle.length > 40 ? inputTitle.substring(0, 40) + '...' : inputTitle,
      result: result
    };

    // Save to Supabase
    const saved = await saveSession({
      appName: 'insightlens',
      sessionType: 'transformation',
      title: inputTitle.substring(0, 100),
      data: {
        localId: localId,
        timestamp: timestamp,
        lens: result.type,
        title: newItem.title,
        result: result
      },
      metadata: {
        lensType: result.type
      }
    });

    // Update ID map
    sessionIdMap.set(localId, saved.session.id);

    return { item: newItem, supabaseId: saved.session.id };
  } catch (error) {
    console.error("Failed to save to library:", error);
    alert("Failed to save transformation. Please try again.");
    return null;
  }
};

export const getLibraryItems = async (): Promise<LibraryItem[]> => {
  try {
    const sessions = await listSessions('insightlens', 50);

    // Build ID map
    sessionIdMap = new Map<string, string>();

    const items: LibraryItem[] = sessions.map((session: SupabaseSession) => {
      sessionIdMap.set(session.data.localId, session.id);
      return {
        id: session.data.localId,
        timestamp: session.data.timestamp,
        lens: session.data.lens,
        title: session.data.title,
        result: session.data.result
      };
    });

    return items;
  } catch (error) {
    console.error("Failed to load library items:", error);
    return [];
  }
};

export const deleteLibraryItem = async (id: string): Promise<LibraryItem[]> => {
  try {
    const supabaseId = sessionIdMap.get(id);
    if (supabaseId) {
      await deleteSession(supabaseId);
      sessionIdMap.delete(id);
    }

    // Return updated list
    return await getLibraryItems();
  } catch (error) {
    console.error("Failed to delete library item:", error);
    throw error;
  }
};

export const clearLibrary = async (): Promise<void> => {
  try {
    const items = await getLibraryItems();
    // Delete all items
    await Promise.all(items.map(item => deleteLibraryItem(item.id)));
  } catch (error) {
    console.error("Failed to clear library:", error);
    throw error;
  }
};

// DEPRECATED: Old localStorage functions - kept for reference
// export const saveToLibrary_OLD = (result: TransformationResult, inputTitle: string): LibraryItem | null => {
//   try {
//     const items = getLibraryItems();
//     const newItem: LibraryItem = { ... };
//     items.unshift(newItem);
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
//       return newItem;
//     } catch (e: any) {
//       if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
//         alert("Storage is full. Please delete old items from the Library to save new ones.");
//         return null;
//       }
//     }
//   } catch (error) {
//     console.error("Failed to save to library:", error);
//     return null;
//   }
// };

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
