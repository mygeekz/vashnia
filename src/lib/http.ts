// src/lib/http.ts  (یا هر جا که دوست دارید)
export const API_BASE =
  import.meta.env.VITE_API_URL || "http://192.168.11.115:3001"; // سرور شما

export async function api<T = unknown>(
  url: string,
  init: RequestInit = {},
  isFormData = false
): Promise<T> {
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  const res = await fetch(`${API_BASE}${url}`, { headers, ...init });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
