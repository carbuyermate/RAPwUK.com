'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/store?tab=orders');
    }, [router]);

    return (
        <div className="dashboard-container container mt-12 text-center text-secondary">
            Przekierowanie do panelu sklepu...
        </div>
    );
}
