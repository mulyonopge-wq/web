import { redirect } from 'next/navigation';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolved = await searchParams;
  const q = resolved.q || resolved.search || '';
  redirect(`/products${q ? `?search=${encodeURIComponent(q)}` : ''}`);
}
