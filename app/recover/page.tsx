"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";

export default function RecoverPage() {
  const [step, setStep] = useState<"password" | "confirm" | "success">("password");
  const [dbPassword, setDbPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbPassword) {
      setError("Database password is required");
      return;
    }
    setStep("confirm");
    setError("");
  };

  const handleReset = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dbPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Recovery failed");
      }

      setStep("success");
    } catch (err) {
      console.error("Reset error:", err);
      setError(err instanceof Error ? err.message : "Recovery failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ClayCard accent="violet" className="flex flex-col items-center gap-6 max-w-sm w-full">
        <h1 className="font-heading font-black text-2xl text-ink">
          Al Rehman <span className="text-violet">Flour Mills</span>
        </h1>

        {step === "password" ? (
          <>
            <p className="text-sm text-muted text-center">Enter Database Password</p>

            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
              <p className="text-blue-900">
                To reset the database, you must enter the encryption password you set during initial setup.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-ink">Database Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={dbPassword}
                    onChange={(e) => setDbPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded text-sm"
                    placeholder="Enter your database password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="w-full flex flex-col gap-2">
                <ClayButton type="submit" className="w-full">
                  Continue
                </ClayButton>
                <a href="/login">
                  <ClayButton type="button" className="w-full" variant="secondary">
                    Cancel
                  </ClayButton>
                </a>
              </div>
            </form>
          </>
        ) : step === "confirm" ? (
          <>
            <p className="text-sm text-muted text-center">Reset Database Setup</p>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
              <p className="font-medium text-yellow-900 mb-2">⚠️ Warning</p>
              <p className="text-yellow-800 mb-3">
                This will delete your database and all data. You'll need to run setup again from the beginning.
              </p>
              <p className="text-yellow-700 text-xs">
                Make sure you back up any important data first!
              </p>
            </div>

            <div className="w-full flex flex-col gap-3">
              <ClayButton
                onClick={handleReset}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Yes, Reset Database"}
              </ClayButton>

              <a href="/login">
                <ClayButton type="button" className="w-full" variant="secondary">
                  Cancel, Go Back
                </ClayButton>
              </a>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm font-medium text-ink mb-2">Database Reset</p>
              <p className="text-xs text-muted mb-6">
                Your database has been deleted. You can now set it up again.
              </p>
            </div>

            <a href="/setup" className="w-full">
              <ClayButton className="w-full">
                Start Setup Again
              </ClayButton>
            </a>
          </>
        )}
      </ClayCard>
    </div>
  );
}
