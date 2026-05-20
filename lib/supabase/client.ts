import { createBrowserClient } from "@supabase/ssr";

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

  const noop: any = {
    from: () => chainable(),
    channel: () => {
      // simple channel builder that returns an object with on/subscribe
      const sub = {
        on: () => ({ subscribe: () => ({}) }),
        subscribe: () => ({}),
      };
      return sub;
    },
    removeChannel: () => { },
    _activeChannels: new Set(),
  };

  noop.cleanupChannels = () => {
    try {
      noop._activeChannels.clear();
    } catch (e) {}
  };

  return noop as any;
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    // Supabase not configured — return a safe no-op client to avoid runtime errors
    return makeNoopClient();
  }

  const client: any = createBrowserClient(url, key);

  // Register client instance on window so callers can cleanup all clients if needed
  try {
    if (typeof window !== 'undefined') {
      (window as any).__supabase_clients = (window as any).__supabase_clients || new Set();
      (window as any).__supabase_clients.add(client);
    }
  } catch (e) {}

  // Track active channels so we can cleanup reliably (helps enforce unsubscriptions)
  try {
    if (!client._activeChannels) client._activeChannels = new Set();

    const origChannel = client.channel.bind(client);
    client.channel = (...args: any[]) => {
      const ch = origChannel(...args);

      // Wrap subscribe to register the returned subscription object
      const chProxy = new Proxy(ch, {
        get(target, prop) {
          if (prop === 'subscribe') {
            return (...sArgs: any[]) => {
              const res = (target as any).subscribe(...sArgs);
              try {
                client._activeChannels.add(res);
              } catch (e) {}
              return res;
            };
          }

          return (target as any)[prop];
        },
      });

      return chProxy;
    };

    const origRemove = client.removeChannel?.bind(client);
    client.removeChannel = (channel: any) => {
      try {
        if (client._activeChannels && client._activeChannels.has(channel)) {
          client._activeChannels.delete(channel);
        }
      } catch (e) {}
      if (origRemove) return origRemove(channel);
    };

    client.cleanupChannels = () => {
      try {
        if (client._activeChannels) {
          for (const ch of Array.from(client._activeChannels)) {
            try {
              if (origRemove) origRemove(ch);
            } catch (e) {}
          }
          client._activeChannels.clear();
        }
      } catch (e) {}
    };
  } catch (e) {
    // Ignore proxy wrapping errors in constrained environments
  }

  return client;
}

// Cleanup helper to remove channels from all supabase client instances created by `createClient()`
export function cleanupAllClients() {
  try {
    if (typeof window === 'undefined') return;
    const set: Set<any> = (window as any).__supabase_clients;
    if (!set) return;
    for (const client of Array.from(set)) {
      try {
        client.cleanupChannels?.();
      } catch (e) {}
    }
    set.clear();
  } catch (e) {}
}
