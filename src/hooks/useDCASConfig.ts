"use client";

import { useState, useEffect } from "react";
import { defaultDCASNames, DCASType } from "@/lib/dcas/scoring";

type DCASNames = Record<DCASType, string>;

export function useDCASConfig() {
    const [dcasNames, setDcasNames] = useState<DCASNames>(defaultDCASNames);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const res = await fetch("/api/admin/dcas-config");
                if (res.ok) {
                    const data = await res.json();
                    if (data.D && data.C && data.A && data.S) {
                        setDcasNames(data);
                    }
                }
            } catch {
                // Use defaults
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, []);

    return {
        dcasNames,
        loading,
        getDCASTypeName: (type: DCASType) => dcasNames[type] || defaultDCASNames[type],
    };
}
