import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "joshua@craftedmarketing.solutions";

export async function POST() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user email matches admin email
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized - not admin email" },
        { status: 403 }
      );
    }

    // Update user metadata to include admin role
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        role: "admin"
      }
    });

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin role set successfully",
      user: {
        email: data.user?.email,
        role: data.user?.user_metadata?.role
      }
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
