'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Projects', href: '/projects' },
  { name: 'Files', href: '/files' },
  { name: 'Chat', href: '/chat' },
  { name: 'Forms', href: '/forms' },
  { name: 'Settings', href: '/settings' },
];

export default function Layout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-800 text-white">
        <div className="p-4 text-2xl font-bold">StageTech Pro</div>
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href}>
                  <p
                    className={`block p-4 ${
                      pathname === link.href ? 'bg-orange-500' : 'hover:bg-slate-700'
                    }`}
                  >
                    {link.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex flex-col flex-1">
        <header className="p-4 bg-white shadow-md">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
