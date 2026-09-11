export function cleanMapsInput(value: string): string {
  let trimmed = (value || '').trim();

  // 1. If user pasted full iframe tag: <iframe src="https://..." ...>
  if (trimmed.includes('<iframe')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      trimmed = match[1].trim();
    }
  }

  // 2. If it's already an embed URL, keep it
  if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) {
    return trimmed;
  }

  // 3. If standard Google Maps URL with coordinates (@lat,lng)
  // e.g. https://www.google.com/maps/@-7.6715484,112.6649258,249m/...
  const coordMatch = trimmed.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[2];
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 4. If Google Maps place URL: https://www.google.com/maps/place/Nama+Tempat/...
  const placeMatch = trimmed.match(/\/maps\/place\/([^/@?]+)/);
  if (placeMatch) {
    const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 5. If maps link with ?q= parameter
  if (trimmed.includes('google.com/maps') && trimmed.includes('q=')) {
    try {
      const url = new URL(trimmed);
      const q = url.searchParams.get('q');
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
      }
    } catch {
      // ignore
    }
  }

  return trimmed;
}

export function getValidMapsUrl(rawUrl?: string | null, address?: string | null, city?: string | null): string {
  const cleaned = cleanMapsInput(rawUrl || '');

  if (cleaned.includes('/maps/embed') || cleaned.includes('output=embed')) {
    return cleaned;
  }

  // Fallback to Address + City query
  const searchQuery = [address, city].filter(Boolean).join(', ').trim();
  if (searchQuery) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // Fallback to Gambiran / Indonesia
  return 'https://maps.google.com/maps?q=Gambiran,Indonesia&t=&z=12&ie=UTF8&iwloc=&output=embed';
}
