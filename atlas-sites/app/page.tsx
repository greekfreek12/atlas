import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Plumber Sites Platform
        </h1>
        <p className="text-gray-600 mb-8">
          Multi-tenant website generator for plumbing businesses
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>Example URLs:</p>
          <ul className="space-y-1">
            <li>
              <Link href="/clean-marco-plumbing" className="text-blue-600 hover:underline">
                /clean-marco-plumbing
              </Link>
            </li>
            <li>
              <Link href="/industrial-joes-plumbing" className="text-blue-600 hover:underline">
                /industrial-joes-plumbing
              </Link>
            </li>
            <li>
              <Link href="/friendly-naples-plumbing-pros" className="text-blue-600 hover:underline">
                /friendly-naples-plumbing-pros
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
