/**
 * Breadcrumbs Component
 * Shows navigation path and allows easy navigation back
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/participants': 'Participantes',
  '/participants/import': 'Importar Participantes',
  '/campaigns': 'Campañas',
  '/campaigns/new': 'Nueva Campaña',
  '/sequences': 'Secuencias',
  '/sequences/new': 'Nueva Secuencia',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Build breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    if (index < pathSegments.length - 1) {
      breadcrumbs.push({ label, href: currentPath });
    } else {
      // Last item (current page) - don't make it a link
      breadcrumbs.push({ label, href: currentPath });
    }
  });

  // Don't show breadcrumbs on dashboard
  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="flex mb-6 bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-900 mx-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-semibold">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-900 hover:text-blue-600 transition-colors font-medium"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

