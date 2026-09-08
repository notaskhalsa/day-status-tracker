import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { apiPost } from "../lib/api";
import { showToast } from "../lib/toast";
import { LayoutGrid } from "lucide-react";

interface LoginProps {
  onLogin: (userId: string, accessToken: string) => void;
  onSignupRequest: () => void;
}

export function Login({ onLogin, onSignupRequest }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiPost("/api/auth/login", { email, password });
      if (!response.ok) {
        const text = await response.text();
        try {
          const errorMsg = JSON.parse(text).error || "Login failed";
          setError(errorMsg);
          showToast.error(errorMsg);
        } catch {
          setError("Login failed");
          showToast.error("Login failed");
        }
        return;
      }
      const data = await response.json();
      if (data.userId && data.token) {
        showToast.success("Logged in successfully!");
        onLogin(data.userId, data.token);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      showToast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl mb-4">
            <LayoutGrid className="w-6 h-6 text-teal-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Sign in to StatusBoard</h1>
        </div>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-slate-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              No account?{" "}
              <button
                onClick={onSignupRequest}
                className="text-teal-600 hover:text-teal-700 font-medium"
                disabled={isLoading}
              >
                Create one
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
