import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Edit, Clock } from "lucide-react";

interface PublicViewerProps {
  data: Record<string, string>;
  isLoggedIn: boolean;
  onEditRequest: () => void;
}

const statusDot: Record<string, string> = {
  Available: "bg-green-500",
  Busy: "bg-red-500",
  Vacation: "bg-blue-500",
  Meeting: "bg-purple-500",
  "Out of Office": "bg-orange-500",
  Travel: "bg-amber-500",
};

export function PublicViewer({ data, isLoggedIn, onEditRequest }: PublicViewerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getStatusForDate = (date: Date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return data[key] || null;
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const selectedStatus = selectedDate ? getStatusForDate(selectedDate) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Daily Status Viewer</h1>
          <p className="text-slate-500 text-sm mt-1">Select a date to view the recorded status</p>
        </div>

        {/* Single column: Calendar on top, status below */}
        <Card className="border border-gray-200 shadow-sm mb-5">
          <CardContent className="pt-4 flex justify-center">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md" />
          </CardContent>
        </Card>

        {/* Status strip */}
        {selectedDate && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Status for</p>
                <p className="text-base font-medium text-slate-900 mt-0.5">{formatDate(selectedDate)}</p>
              </div>
              {selectedStatus ? (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusDot[selectedStatus] || "bg-gray-400"}`} />
                    <span className="text-sm font-medium text-slate-700">{selectedStatus}</span>
                  </span>
                  {isLoggedIn && (
                    <Button variant="outline" size="sm" onClick={onEditRequest} className="text-xs">
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  )}
                </div>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Clock className="w-4 h-4" /> No status
                </span>
              )}
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <p className="text-sm text-slate-500 text-center mb-5">
            <button onClick={onEditRequest} className="text-teal-600 font-medium hover:underline">Sign in</button> to edit statuses.
          </p>
        )}

        {/* Recent updates — horizontal chips */}
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Recent Updates</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data)
              .filter(([_, s]) => s)
              .slice(-8)
              .map(([key, status]) => {
                const [y, m, d] = key.split("-").map(Number);
                const date = new Date(y, m, d);
                return (
                  <span key={key} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[status] || "bg-gray-400"}`} />
                    <span className="text-slate-500">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span className="text-slate-700 font-medium">{status}</span>
                  </span>
                );
              })}
            {Object.keys(data).filter((k) => data[k]).length === 0 && (
              <p className="text-sm text-slate-400">No updates yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
