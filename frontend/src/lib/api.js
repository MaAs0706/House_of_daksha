const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  let response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new Error("Can’t reach the admin service. Start the backend locally or configure VITE_API_BASE_URL to point to the deployed backend.");
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (response.status === 404 && (path.startsWith("/auth/") || path.startsWith("/admin/"))) {
    throw new Error("The admin API returned 404. Deploy the backend and configure VITE_API_BASE_URL for this website.");
  }
  if (response.status >= 500 && !data.error) {
    throw new Error("The admin service could not complete this request. Check the backend and database configuration.");
  }
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export const formatPrice = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(Number(value) || 0);
