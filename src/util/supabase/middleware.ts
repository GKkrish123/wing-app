import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {  
  const { pathname, origin } = request.nextUrl;

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
             
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // await supabase.auth.getUser();
  const { data } = await supabase.auth.getUser();  
  const isLoginPage = pathname === "/login";
  const isAuthCallback = pathname === "/auth/callback";
  const isAuthErrorPage = pathname === "/auth/auth-code-error";
  const user = data.user;

  if (isAuthCallback || isAuthErrorPage) {
    return supabaseResponse;
  }

  if (!user && !isLoginPage) {
    return NextResponse.redirect(`${origin}/login`);
  } else if (user && isLoginPage) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // const { data: onboardingStatus } = await supabase.from("User").select("hasCompletedOnboarding").eq("id", user.user?.id);
  // console.log("onboardingStatus", onboardingStatus);
  
  // if (!onboardingStatus) {
  //   return NextResponse.redirect("/onboarding");
  // }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}