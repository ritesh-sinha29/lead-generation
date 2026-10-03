'use client';

import React, { ReactNode, useMemo } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

interface Props {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: Props) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const client = useMemo(() => {
    if (!convexUrl) return null;
    try {
      return new ConvexReactClient(convexUrl);
    } catch {
      return null;
    }
  }, [convexUrl]);

  if (!client) {
    // If Convex is not yet connected with a live deployment URL, render children cleanly
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
