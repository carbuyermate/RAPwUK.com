'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
    type: 'news' | 'events' | 'rappers' | 'ads';
    id: string;
}

export function ViewTracker({ type, id }: ViewTrackerProps) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;

        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, id }),
        }).catch(() => {}); // silent fail
    }, [type, id]);

    return null;
}
