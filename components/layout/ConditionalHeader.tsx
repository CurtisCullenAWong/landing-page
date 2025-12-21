'use client';

import { usePathname } from 'next/navigation';
import { AdminHeader } from './AdminHeader';
import { UserHeader } from './UserHeader';

export function ConditionalHeader() {
  const pathname = usePathname() ?? '';
  const isAdminPage = pathname.startsWith('/admin');

  return isAdminPage ? <AdminHeader /> : <UserHeader />;
}

