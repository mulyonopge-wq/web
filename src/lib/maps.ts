export function getValidMapsUrl(rawUrl?: string | null, address?: string | null, city?: string | null): string {
  const trimmed = (rawUrl || '').trim();

  // If user pasted full iframe tag: <iframe src="https://..." ...>
  if (trimmed.includes('<iframe')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If already a valid http(s) url
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }

  // Fallback: generate Google Maps embed query from Address and City
  const searchQuery = [address, city].filter(Boolean).join(', ').trim();
  if (searchQuery) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // Default fallback to Indonesia/Jakarta if completely empty
  return 'https://maps.google.com/maps?q=Indonesia&t=&z=6&ie=UTF8&iwloc=&output=embed';
}
