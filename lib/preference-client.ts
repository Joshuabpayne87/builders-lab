import type { UserPreferences } from "./preference-service";

/**
 * Records a user preference
 */
export async function recordPreference(
  appName: string,
  selectionType: 'vibe' | 'tone' | 'color' | 'platform' | 'content_type',
  value: string | string[]
) {
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record',
        appName,
        selectionType,
        value
      })
    });

    if (!response.ok) {
      console.warn('Failed to record preference');
    }
  } catch (error) {
    console.warn('Preference recording failed:', error);
  }
}

/**
 * Get user's analyzed preferences
 */
export async function getPreferences(appName?: string): Promise<UserPreferences | null> {
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyze',
        appName
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.preferences || null;
  } catch (error) {
    console.warn('Failed to get preferences:', error);
    return null;
  }
}

/**
 * Get recommended vibe
 */
export async function getRecommendedVibe(appName?: string): Promise<string | null> {
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getRecommendedVibe',
        appName
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.vibe || null;
  } catch (error) {
    console.warn('Failed to get recommended vibe:', error);
    return null;
  }
}

/**
 * Get preference context for AI prompts
 */
export async function getPreferenceContext(appName?: string): Promise<string> {
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getContext',
        appName
      })
    });

    if (!response.ok) return '';
    const data = await response.json();
    return data.context || '';
  } catch (error) {
    console.warn('Failed to get preference context:', error);
    return '';
  }
}
