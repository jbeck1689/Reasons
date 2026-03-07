import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Only protect these routes — public pages like / and /login are open
export const config = {
  matcher: [
    "/courses/:path*",
    "/learn/:path*",
    "/progress/:path*",
    "/admin/:path*",
  ],
};
