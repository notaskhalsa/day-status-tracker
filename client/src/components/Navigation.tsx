import React from "react";
import { Button } from "./ui/button";
import { LogOut, LogIn, LayoutGrid, Globe } from "lucide-react";

interface NavigationProps {
  currentPage: "dashboard" | "public";
  onPageChange: (page: "dashboard" | "public") => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

export function Navigation({
  currentPage,
  onPageChange,
  onLogout,
  isLoggedIn,
}: NavigationProps) {
  return (
    <nav className="bg-slate-900 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-2">
            <LayoutGrid className="w-5 h-5 text-teal-400" />
            <span className="text-base font-semibold text-white tracking-tight">
              StatusBoard
            </span>
          </div>

          <div className="flex items-center space-x-0.5">
            <button
              onClick={() => onPageChange("public")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentPage === "public"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Viewer
              </span>
            </button>
            {isLoggedIn && (
              <button
                onClick={() => onPageChange("dashboard")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentPage === "dashboard"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Dashboard
                </span>
              </button>
            )}
          </div>
        </div>

        <div>
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => onPageChange("dashboard")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-md transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
