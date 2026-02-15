"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { DCASType, defaultDCASNames } from "@/lib/dcas/scoring";

export default function DCASConfigurationPage() {
    const [names, setNames] = useState<Record<DCASType, string>>(defaultDCASNames);
    const [symbols, setSymbols] = useState<Record<DCASType, string>>({ D: "D", C: "C", A: "A", S: "S" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => { fetchConfig(); }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const [namesRes, symbolsRes] = await Promise.all([
                fetch("/api/admin/dcas-config"),
                fetch("/api/admin/settings?key=dcas_symbols"),
            ]);
            if (namesRes.ok) { const data = await namesRes.json(); setNames(data); }
            if (symbolsRes.ok) { const data = await symbolsRes.json(); if (data?.dcas_symbols) setSymbols(data.dcas_symbols); }
        } catch (e) { console.error("Failed to fetch DCAS config", e); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await Promise.all([
                fetch("/api/admin/dcas-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(names) }),
                fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dcas_symbols: symbols }) }),
            ]);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) { console.error("Failed to save DCAS config", e); }
        finally { setSaving(false); }
    };

    const handleNameChange = (type: DCASType, value: string) => setNames((prev) => ({ ...prev, [type]: value }));
    const handleSymbolChange = (type: DCASType, value: string) => setSymbols((prev) => ({ ...prev, [type]: value }));

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

    const typeConfigs: { type: DCASType; label: string; colorText: string; bgClass: string; placeholder: string; description: string }[] = [
        { type: "D", label: "D - Driver", colorText: "text-red-500", bgClass: "bg-red-50/50", placeholder: "e.g. Driver", description: "Active, forceful, and result-oriented." },
        { type: "C", label: "C - Connector", colorText: "text-amber-500", bgClass: "bg-amber-50/50", placeholder: "e.g. Connector", description: "Outgoing, enthusiastic, and people-oriented." },
        { type: "A", label: "A - Anchor", colorText: "text-emerald-500", bgClass: "bg-emerald-50/50", placeholder: "e.g. Anchor", description: "Patient, humble, and team-oriented." },
        { type: "S", label: "S - Strategist", colorText: "text-blue-500", bgClass: "bg-blue-50/50", placeholder: "e.g. Strategist", description: "Analytical, precise, and detail-oriented." },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold tracking-tight">DCAS Configuration</h1><p className="text-muted-foreground">Customize the names and symbols of DCAS personality types</p></div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchConfig} disabled={saving}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : saved ? <><Save className="mr-2 h-4 w-4" />Saved!</> : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>DCAS Identity</CardTitle><CardDescription>Define how each DCAS type matches your brand. Use custom names and symbols (1–2 chars or emoji).</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {typeConfigs.map(({ type, label, colorText, bgClass, placeholder, description }) => (
                            <div key={type} className={`space-y-4 p-4 border rounded-lg ${bgClass}`}>
                                <Label htmlFor={`type-${type}`} className={`${colorText} font-bold block mb-2`}>{label}</Label>
                                <div className="grid grid-cols-[1fr_80px] gap-2">
                                    <div className="space-y-1"><Label className="text-xs">Name</Label><Input id={`type-${type}`} value={names[type]} onChange={(e) => handleNameChange(type, e.target.value)} placeholder={placeholder} /></div>
                                    <div className="space-y-1"><Label className="text-xs">Symbol</Label><Input value={symbols[type]} onChange={(e) => handleSymbolChange(type, e.target.value)} placeholder={type} maxLength={2} className="text-center font-bold" /></div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">{description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
