import { useEffect } from 'react';

/**
 * Hook to set the page title dynamically for client components
 * @param title - The title to set (will be appended with " | Boss Cargo Express")
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    // If infinite scroll is managing the title, skip the individual page hook
    if (typeof window !== 'undefined' && (window as any).__disablePageTitleHook) {
      return;
    }
    
    const fullTitle = title ? `${title} | Boss Cargo Express` : 'Boss Cargo Express';
    document.title = fullTitle;
  }, [title]);
}

