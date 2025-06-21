import { NextRequest, NextResponse } from "next/server"

const PROJECT_REF = "ooqwlllgwgjmoyxfavaz" // <-- Tu Project Ref de Supabase
const AUTH_COOKIE = `sb-${PROJECT_REF}-auth-token`

const PROTECTED_PATHS = [
  "/dashboard",
  "/entries",
  "/exercises",
  "/machines",
  // agrega aquí más rutas privadas si las tienes
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Busca la cookie de sesión de Supabase (la correcta para Vercel)
  const accessToken = request.cookies.get(AUTH_COOKIE)?.value

  const needsAuth = PROTECTED_PATHS.some(path =>
    pathname === path || pathname.startsWith(path + "/")
  )

  if (needsAuth && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard",
    "/entries/:path*",
    "/exercises/:path*",
    "/machines/:path*",
    // agrega aquí más si necesitas
  ],
}
