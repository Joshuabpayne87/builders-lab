import { createClient } from "./client";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: Record<string, any>;
}

/**
 * Get user profile
 */
export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  const supabase = createClient();

  try {
    let userIdToUse = userId;
    if (!userIdToUse) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      userIdToUse = user.id;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userIdToUse)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception fetching profile:", error);
    return null;
  }
}

/**
 * Create user profile
 */
export async function createUserProfile(data: UpdateProfileData): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("user_profiles")
      .insert({
        user_id: user.id,
        ...data,
      });

    if (error) {
      console.error("Error creating profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Exception creating profile:", error);
    return { success: false, error: error.message || "Failed to create profile" };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: UpdateProfileData): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Exception updating profile:", error);
    return { success: false, error: error.message || "Failed to update profile" };
  }
}

/**
 * Update profile picture
 */
export async function updateProfilePicture(avatarUrl: string): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile({ avatar_url: avatarUrl });
}

/**
 * Update user name
 */
export async function updateUserName(fullName: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // Update in profiles table
    const profileResult = await updateUserProfile({ full_name: fullName });
    if (!profileResult.success) {
      return profileResult;
    }

    // Also update in auth metadata
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (error) {
      console.error("Error updating auth metadata:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Exception updating name:", error);
    return { success: false, error: error.message || "Failed to update name" };
  }
}

/**
 * Get or create profile (ensures profile exists)
 */
export async function getOrCreateProfile(): Promise<UserProfile | null> {
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Try to get existing profile
    let profile = await getUserProfile(user.id);

    // If no profile exists, create one
    if (!profile) {
      const fullName = user.user_metadata?.full_name || "";
      const avatarUrl = user.user_metadata?.avatar_url || "";

      await createUserProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      // Fetch the newly created profile
      profile = await getUserProfile(user.id);
    }

    return profile;
  } catch (error) {
    console.error("Exception in getOrCreateProfile:", error);
    return null;
  }
}
