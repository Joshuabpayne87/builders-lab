import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/join",
    "/api/resources",
    "/api/resources/page",
    "/api/test",
    "/api/ghost/webhook",
    "/api/membership/claim",
    "/signup",
  ];

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );

  const isAuthRoute = pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === "admin";

  // Redirect to login if not authenticated and trying to access protected route
  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Protect admin routes - only admins can access
  if (isAdminRoute && (!user || !isAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/dashboard" : "/auth/login";
    return NextResponse.redirect(url);
  }

  const paidExemptRoutes = [
    ...publicRoutes,
    "/auth",
    "/settings",
  ];

  const isPaidExemptRoute = paidExemptRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );

  if (user && !isAdmin && isAuthRoute) {
    const { data: membership } = await supabase
      .from("bl_memberships")
      .select("is_paid")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership?.is_paid) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  if (user && !isAdmin && !isPaidExemptRoute) {
    const { data: membership } = await supabase
      .from("bl_memberships")
      .select("is_paid")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership?.is_paid) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Payment required." }, { status: 402 });
      }

      const url = request.nextUrl.clone();
      url.pathname = "/join";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
