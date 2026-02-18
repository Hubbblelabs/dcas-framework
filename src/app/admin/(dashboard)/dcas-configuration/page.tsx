"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Save,
  RefreshCw,
  Upload,
  Trash2,
  ImageIcon,
} from "lucide-react";
import {
  DCASType,
  defaultDCASNames,
  dcasColors as defaultDcasColorMap,
} from "@/lib/dcas/scoring";
import Image from "next/image";

export default function DCASConfigurationPage() {
  const [names, setNames] =
    useState<Record<DCASType, string>>(defaultDCASNames);
  const [symbols, setSymbols] = useState<Record<DCASType, string>>({
    D: "D",
    C: "C",
    A: "A",
    S: "S",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [colors, setColors] = useState<Record<DCASType, string>>({
    D: defaultDcasColorMap.D.primary,
    C: defaultDcasColorMap.C.primary,
    A: defaultDcasColorMap.A.primary,
    S: defaultDcasColorMap.S.primary,
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const [namesRes, symbolsRes, colorsRes] = await Promise.all([
        fetch("/api/admin/dcas-config"),
        fetch("/api/admin/settings?key=dcas_symbols"),
        fetch("/api/admin/settings?key=dcas_colors"),
      ]);
      if (namesRes.ok) {
        const data = await namesRes.json();
        setNames(data);
      }
      if (symbolsRes.ok) {
        const data = await symbolsRes.json();
        if (data?.dcas_symbols) setSymbols(data.dcas_symbols);
      }
      if (colorsRes.ok) {
        const data = await colorsRes.json();
        if (data?.dcas_colors) setColors(data.dcas_colors);
      }
      // Fetch logo
      const logoRes = await fetch("/api/admin/logo");
      if (logoRes.ok) {
        const data = await logoRes.json();
        if (data?.logoUrl) setLogoUrl(data.logoUrl);
      }
    } catch (e) {
      console.error("Failed to fetch DCAS config", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        fetch("/api/admin/dcas-config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(names),
        }),
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dcas_symbols: symbols, dcas_colors: colors }),
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save DCAS config", e);
    } finally {
      setSaving(false);
    }
  };

  const handleNameChange = (type: DCASType, value: string) =>
    setNames((prev) => ({ ...prev, [type]: value }));
  const handleSymbolChange = (type: DCASType, value: string) =>
    setSymbols((prev) => ({ ...prev, [type]: value }));
  const handleColorChange = (type: DCASType, value: string) =>
    setColors((prev) => ({ ...prev, [type]: value }));

  if (loading)
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );

  const typeConfigs: {
    type: DCASType;
    label: string;
    colorText: string;
    bgClass: string;
    placeholder: string;
    description: string;
  }[] = [
    {
      type: "D",
      label: "D - Driver",
      colorText: "text-red-500",
      bgClass: "bg-red-50/50 dark:bg-red-900/20",
      placeholder: "e.g. Driver",
      description: "Active, forceful, and result-oriented.",
    },
    {
      type: "C",
      label: "C - Connector",
      colorText: "text-amber-500",
      bgClass: "bg-amber-50/50 dark:bg-amber-900/20",
      placeholder: "e.g. Connector",
      description: "Outgoing, enthusiastic, and people-oriented.",
    },
    {
      type: "A",
      label: "A - Anchor",
      colorText: "text-emerald-500",
      bgClass: "bg-emerald-50/50 dark:bg-emerald-900/20",
      placeholder: "e.g. Anchor",
      description: "Patient, humble, and team-oriented.",
    },
    {
      type: "S",
      label: "S - Strategist",
      colorText: "text-blue-500",
      bgClass: "bg-blue-50/50 dark:bg-blue-900/20",
      placeholder: "e.g. Strategist",
      description: "Analytical, precise, and detail-oriented.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            DCAS Configuration
          </h1>
          <p className="text-muted-foreground">
            Customize the names and symbols of DCAS behavioural types
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchConfig} disabled={saving}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DCAS Type Configuration</CardTitle>
          <CardDescription>
            Customize the names, symbols, and colors for each behavioural type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {typeConfigs.map(
              ({
                type,
                label,
                colorText,
                bgClass,
                placeholder,
                description,
              }) => (
                <div
                  key={type}
                  className={`space-y-4 rounded-lg border p-4 ${bgClass}`}
                >
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`type-${type}`}
                      className={`${colorText} block font-bold`}
                    >
                      {label}
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors[type]}
                        onChange={(e) => handleColorChange(type, e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded-full border-0 p-0"
                      />
                      <span className="font-mono text-[10px] opacity-70">
                        {colors[type]}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_80px] gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        id={`type-${type}`}
                        value={names[type]}
                        onChange={(e) => handleNameChange(type, e.target.value)}
                        placeholder={placeholder}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Symbol</Label>
                      <Input
                        value={symbols[type]}
                        onChange={(e) =>
                          handleSymbolChange(type, e.target.value)
                        }
                        placeholder={type}
                        maxLength={2}
                        className="bg-background text-center font-bold"
                      />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">{description}</p>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo Customization</CardTitle>
          <CardDescription>
            Upload a custom logo to replace the default logo across the entire
            platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Custom Logo"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-lg object-contain"
                  unoptimized
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">
                {logoUrl
                  ? "Current custom logo"
                  : "No custom logo set (using default)"}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingLogo}
                  onClick={() =>
                    document.getElementById("logo-upload")?.click()
                  }
                >
                  {uploadingLogo ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload Logo
                </Button>
                {logoUrl && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={uploadingLogo}
                    onClick={async () => {
                      setUploadingLogo(true);
                      try {
                        await fetch("/api/admin/logo", { method: "DELETE" });
                        setLogoUrl(null);
                      } catch (e) {
                        console.error("Failed to delete logo", e);
                      } finally {
                        setUploadingLogo(false);
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingLogo(true);
                  try {
                    const formData = new FormData();
                    formData.append("logo", file);
                    const res = await fetch("/api/admin/logo", {
                      method: "POST",
                      body: formData,
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setLogoUrl(data.logoUrl);
                    }
                  } catch (err) {
                    console.error("Failed to upload logo", err);
                  } finally {
                    setUploadingLogo(false);
                    e.target.value = "";
                  }
                }}
              />
              <p className="text-muted-foreground text-xs">
                Accepted: PNG, JPEG, SVG, WebP. Max 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
