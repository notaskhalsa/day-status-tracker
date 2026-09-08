import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Save, RotateCcw, Sparkles, CalendarDays, CheckCircle, TrendingUp, Flame } from "lucide-react";
import { apiPost } from "../lib/api";
import { showToast } from "../lib/toast";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const getDaysInMonth = (m: number, y: number) => (m === 1 && isLeapYear(y) ? 29 : daysInMonth[m]);

const statusOptions = ["Available", "Busy", "Out of Office", "Meeting", "Travel", "Vacation"];
const NO_STATUS = "none";

const legendItems = [
  { s: "Available", c: "bg-green-500" }, { s: "Busy", c: "bg-red-500" },
  { s: "Out of Office", c: "bg-orange-500" }, { s: "Meeting", c: "bg-purple-500" },
  { s: "Travel", c: "bg-amber-500" }, { s: "Vacation", c: "bg-blue-500" },
];

interface DashboardProps {
  data: Record<string, string>;
  onDataChange: (data: Record<string, string>) => void;
  userId: string;
  accessToken: string;
}

export function Dashboard({ data, onDataChange, userId, accessToken }: DashboardProps) {
  const [currentData, setCurrentData] = useState(data);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [fillMonth, setFillMonth] = useState<string>("all");
  const [fillStatus, setFillStatus] = useState<string>(statusOptions[0]);

  React.useEffect(() => { setCurrentData(data); }, [data]);

  const { totalTracked, activeCount, completionRate, streakDays } = useMemo(() => {
    const entries = Object.entries(currentData);
    const tracked = entries.length;
    const active = entries.filter(([, v]) => v === "Available").length;
    const completion = Math.round(((tracked / 365) * 100 + Number.EPSILON) * 10) / 10;

    const calculateStreak = (d: Record<string, string>) => {
      if (!Object.keys(d).length) return 0;
      const sorted = Object.entries(d).sort(([a], [b]) => {
        const [yA, mA, dA] = a.split("-").map(Number);
        const [yB, mB, dB] = b.split("-").map(Number);
        return new Date(yA, mA, dA).getTime() - new Date(yB, mB, dB).getTime();
      });
      let cur = 0, max = 0, last: string | null = null;
      for (const [, s] of sorted) {
        if (s === last && s) cur++; else { max = Math.max(max, cur); cur = s ? 1 : 0; last = s; }
      }
      return Math.max(max, cur);
    };

    return { totalTracked: tracked, activeCount: active, completionRate: isNaN(completion) ? 0 : completion, streakDays: calculateStreak(currentData) };
  }, [currentData]);

  const handleCellChange = (month: number, day: number, value: string) => {
    const key = `${selectedYear}-${month}-${day}`;
    setCurrentData({ ...currentData, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiPost(`/api/status/${userId}`, { statusData: currentData }, accessToken);
      if (!res.ok) { showToast.error("Failed to save."); return; }
      await res.json();
      onDataChange(currentData);
      setHasChanges(false);
      showToast.success("Saved!");
    } catch { showToast.error("Network error."); } finally { setIsSaving(false); }
  };

  const handleAutoFill = () => {
    const updated = { ...currentData };
    const monthsToFill = fillMonth === "all"
      ? months.map((_, i) => i)
      : [parseInt(fillMonth)];

    let count = 0;
    for (const mi of monthsToFill) {
      const days = getDaysInMonth(mi, selectedYear);
      for (let d = 1; d <= days; d++) {
        const key = `${selectedYear}-${mi}-${d}`;
        updated[key] = fillStatus;
        count++;
      }
    }

    setCurrentData(updated);
    setHasChanges(true);
    const label = fillMonth === "all" ? `all months of ${selectedYear}` : `${months[parseInt(fillMonth)]} ${selectedYear}`;
    showToast.success(`Set ${count} days in ${label} to "${fillStatus}"`);
  };

  const stats = [
    { label: "Total Tracked", value: totalTracked, icon: CalendarDays, border: "border-l-teal-500", iconColor: "text-teal-500" },
    { label: "Available", value: activeCount, icon: CheckCircle, border: "border-l-green-500", iconColor: "text-green-500" },
    { label: "Completion", value: `${completionRate}%`, icon: TrendingUp, border: "border-l-blue-500", iconColor: "text-blue-500" },
    { label: "Streak", value: streakDays > 0 ? streakDays : "—", icon: Flame, border: "border-l-orange-500", iconColor: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Annual status overview</p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white">
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Stat cards with colored left border + icon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`bg-white border border-gray-200 border-l-4 ${s.border} rounded-lg px-4 py-3 flex items-center gap-3`}>
              <s.icon className={`w-5 h-5 ${s.iconColor} flex-shrink-0`} />
              <div>
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className="text-lg font-semibold text-slate-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar: Year selector + Auto-fill + Legend */}
        <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Year:</span>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => {
                  const y = new Date().getFullYear() - 5 + i;
                  return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>;
                })}
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-gray-200" />

            <span className="text-sm font-medium text-slate-500">Auto-fill:</span>
            <Select value={fillMonth} onValueChange={setFillMonth}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((m, i) => (
                  <SelectItem key={m} value={i.toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-xs text-slate-400">with</span>

            <Select value={fillStatus} onValueChange={setFillStatus}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button variant="default" size="sm" className="h-8 bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={handleAutoFill}>
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Apply
            </Button>

            <div className="w-px h-6 bg-gray-200" />

            <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600 h-8"
              onClick={() => { setCurrentData({}); setHasChanges(true); showToast.info("Cleared. Save to confirm."); }}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear All
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {legendItems.map(({ s, c }) => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${c}`} /> {s}
              </span>
            ))}
          </div>
        </div>

        {/* Full-width grid — no sidebar */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-2 sm:p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-1.5 border border-gray-200 bg-gray-50 w-12 text-xs font-medium text-slate-500">Day</th>
                    {months.map((m) => (
                      <th key={m} className="p-1.5 border border-gray-200 bg-gray-50 min-w-24 text-xs font-medium text-slate-500">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 31 }, (_, day) => (
                    <tr key={day}>
                      <td className="p-1.5 border border-gray-200 bg-gray-50 text-center text-xs font-medium text-slate-400">{day + 1}</td>
                      {months.map((_, mi) => {
                        const valid = day + 1 <= getDaysInMonth(mi, selectedYear);
                        const cellKey = `${selectedYear}-${mi}-${day + 1}`;
                        const val = currentData[cellKey] || "";
                        return (
                          <td key={`${mi}-${day}`} className={`p-0.5 border border-gray-200 ${!valid ? "bg-gray-100" : ""}`}>
                            {valid ? (
                              <Select value={val === "" ? NO_STATUS : val} onValueChange={(v) => handleCellChange(mi, day + 1, v === NO_STATUS ? "" : v)}>
                                <SelectTrigger className="w-full h-7 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NO_STATUS}>No Status</SelectItem>
                                  {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="h-7 flex items-center justify-center text-gray-300 text-xs">N/A</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
