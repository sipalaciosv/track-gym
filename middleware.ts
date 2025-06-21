// middleware.ts
import { NextRequest, NextResponse } from "next/server"

// Define las rutas que quieres proteger (empiezan con estos paths)
const PROTECTED_PATHS = [
  "/dashboard",
  "/entries",
  "/exercises",
  "/machines",
  // agrega aquí más rutas privadas si las tienes
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Busca la cookie de sesión de Supabase (por defecto "sb-access-token")
  const accessToken = request.cookies.get("sb-access-token")?.value

  // Si la ruta coincide con alguna protegida Y no hay token de sesión, redirige a login
  const needsAuth = PROTECTED_PATHS.some(path =>
    pathname === path || pathname.startsWith(path + "/")
  )

  if (needsAuth && !accessToken) {
    // Redirige a /login (puedes ajustar el path si usas otra ruta)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Deja pasar a rutas públicas, o si está logeado
  return NextResponse.next()
}

// Configura el matcher para que solo ejecute el middleware en rutas protegidas
export const config = {
  matcher: [
    "/dashboard",
    "/entries/:path*",
    "/exercises/:path*",
    "/machines/:path*",
    // agrega aquí más si necesitas
  ],
}
