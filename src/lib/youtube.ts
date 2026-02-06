/**
 * YouTube utility functions for extracting video IDs and thumbnails
 */

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - dQw4w9WgXcQ (raw ID)
 */
export function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;

  // Check if it's already a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Match patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get YouTube video thumbnail URL
 * Returns the highest quality available (hqdefault = 480x360)
 */
export function getYoutubeThumbnail(videoId: string): string {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Validate if a URL is a valid YouTube URL
 */
export function isValidYoutubeUrl(url: string): boolean {
  return extractYoutubeVideoId(url) !== null;
}

/**
 * Get embeddable YouTube URL from video ID
 */
export function getYoutubeEmbedUrl(videoId: string): string {
  if (!videoId) return '';
  return `https://www.youtube.com/embed/${videoId}`;
}
