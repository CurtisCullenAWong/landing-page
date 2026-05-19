import { createBrowserClient } from '@supabase/ssr'

function makeNoopClient() {
  const terminal = async (value: any = null) => ({ data: value, error: null });

  const chainable = () => ({
    select: () => ({ order: async () => terminal([]), single: async () => terminal(null) }),
    insert: () => ({ select: async () => terminal([]), single: async () => terminal(null) }),
    update: () => ({ select: async () => terminal([]), single: async () => terminal(null) }),
    delete: () => ({ select: async () => terminal([]), single: async () => terminal(null) }),
    order: async () => terminal([]),
    eq: () => chainable(),
  });

  return {
    from: () => chainable(),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
    }),
    removeChannel: () => { },
  } as any;
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return makeNoopClient();
  }

  return createBrowserClient(url, key)
}
