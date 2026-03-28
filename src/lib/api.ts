import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Fetch from the backend with JWT Authorization header.
 * Falls back gracefully to an empty result on failure.
 */
export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`[API] ${path} → ${res.status} ${res.statusText}`);
    return null;
  }

  return res.json();
}
