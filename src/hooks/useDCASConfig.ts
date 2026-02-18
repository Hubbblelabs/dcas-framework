"use client";

import { useState, useEffect } from "react";
import {
  defaultDCASNames,
  DCASType,
  dcasColors as defaultDcasColors,
} from "@/lib/dcas/scoring";

type DCASNames = Record<DCASType, string>;
type DCASColorConfig = Record<
  DCASType,
  { primary: string; light: string; bg: string }
>;

function hexToLightVariant(hex: string): string {
  // Convert hex to a light background variant
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
}

export function useDCASConfig() {
  const [dcasNames, setDcasNames] = useState<DCASNames>(defaultDCASNames);
  const [dcasColors, setDcasColors] =
    useState<DCASColorConfig>(defaultDcasColors);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [namesRes, settingsRes] = await Promise.all([
          fetch("/api/admin/dcas-config"),
          fetch("/api/admin/settings?key=dcas_colors"),
        ]);
        if (namesRes.ok) {
          const data = await namesRes.json();
          if (data.D && data.C && data.A && data.S) {
            setDcasNames(data);
          }
        }
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data?.dcas_colors) {
            const custom = data.dcas_colors;
            const colors: DCASColorConfig = { ...defaultDcasColors };
            (["D", "C", "A", "S"] as DCASType[]).forEach((type) => {
              if (custom[type]) {
                colors[type] = {
                  primary: custom[type],
                  light: hexToLightVariant(custom[type]),
                  bg: defaultDcasColors[type].bg,
                };
              }
            });
            setDcasColors(colors);
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
    dcasColors,
    loading,
    getDCASTypeName: (type: DCASType) =>
      dcasNames[type] || defaultDCASNames[type],
    getDCASColor: (type: DCASType) =>
      dcasColors[type] || defaultDcasColors[type],
  };
}
