/**
 * Resolve avatar/upload paths for <img src>.
 * Uses relative URLs in dev so Vite proxy can forward /uploads to the backend.
 */
export function resolveMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const normalized = url.startsWith("/") ? url : `/${url}`;
  const apiBase = import.meta.env.VITE_API_URL;

  if (apiBase) {
    return `${apiBase.replace(/\/$/, "")}${normalized}`;
  }

  return normalized;
}

export function getAvatarFallback(name = "U", size = 150) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=4f46e5&color=fff`;
}
