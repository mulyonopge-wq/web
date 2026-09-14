/**
 * Utility functions for determining media types (Images, Videos, YouTube)
 */

export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Support patterns:
  // - https://www.youtube.com/watch?v=ID
  // - https://youtu.be/ID
  // - https://www.youtube.com/shorts/ID
  // - https://www.youtube.com/embed/ID
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/ ]{11})/i
  );
  return match && match[1] ? match[1] : null;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return !!getYouTubeVideoId(url);
}

export function getYouTubeThumbnail(url: string | null | undefined): string {
  const id = getYouTubeVideoId(url);
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string {
  const id = getYouTubeVideoId(url);
  if (!id) return '';
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&rel=0`;
}

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (isYouTubeUrl(url)) return true;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v')
  );
}
