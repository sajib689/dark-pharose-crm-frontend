import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;
    const isAdmin = role === "SUPER_ADMIN" || role === "PROJECT_MANAGER";

    // 1. Root redirect (Internal routing after login)
    if (pathname === "/") {
      if (token) {
        if (isAdmin) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/member-dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2. Restricted dashboard access for non-admins
    if (pathname === "/dashboard" && token && !isAdmin) {
      return NextResponse.redirect(new URL("/member-dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // 1. Always allow public paths
        if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
          return true;
        }

        // 2. Require token for all other paths
        if (!token) return false;

        // 3. Role-based path checks
        const role = token.role as string;
        const isAdmin = role === "SUPER_ADMIN" || role === "PROJECT_MANAGER";

        // Admin-only routes
        const adminOnlyPaths = ["/team", "/reports", "/dashboard"];
        if (adminOnlyPaths.some(p => pathname.startsWith(p)) && !isAdmin) {
          return false;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api/auth routes (must be public for NextAuth)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
