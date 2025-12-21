import { useEffect } from 'react';

/**
 * Hook to set the page title dynamically for client components
 * @param title - The title to set (will be appended with " | Boss Cargo Express")
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Boss Cargo Express` : 'Boss Cargo Express';
    document.title = fullTitle;
  }, [title]);
}

