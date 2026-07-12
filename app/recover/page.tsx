"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";

type Mode = "choose" | "reset-password" | "reset-confirm" | "reset-done" | "master" | "master-done";

export default function RecoverPage() {
  const [mode, setMode] = useState<Mode>("choose");
  const [dbPassword, setDbPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [masterMessage, setMasterMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goTo = (next: Mode) => {
    setMode(next);
    setError("");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbPassword) {
      setError("Database password is required");
      return;
    }
    goTo("reset-confirm");
  };

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recovery failed");
      setMode("reset-done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recovery failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMasterRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim()) {
      setError("Recovery code is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recover/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryCode: recoveryCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recovery failed");
      setMasterMessage(data.message);
      setMode("master-done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recovery failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ClayCard accent="violet" className="flex flex-col items-center gap-6 max-w-sm w-full">
        <h1 className="font-heading font-black text-2xl text-ink">
          Al Rehman <span className="text-violet">Flour Mills</span>
        </h1>

        {mode === "choose" && (
          <>
            <p className="text-sm text-muted text-center">Account &amp; Database Recovery</p>

            <div className="w-full flex flex-col gap-3">
              <ClayButton onClick={() => goTo("master")} className="w-full">
                🔑 Use Emergency Recovery Code
              </ClayButton>
              <p className="text-xs text-muted text-center -mt-1">
                Restores owner access without losing any data. Requires the recovery code held by
                the software provider.
              </p>

              <ClayButton onClick={() => goTo("reset-password")} className="w-full" variant="secondary">
                🗑️ Reset Database (deletes everything)
              </ClayButton>
              <p className="text-xs text-muted text-center -mt-1">
                Wipes all data and starts setup from scratch. Requires the database password.
              </p>

              <a href="/login" className="w-full">
                <ClayButton type="button" className="w-full" variant="secondary">
                  Back to Login
                </ClayButton>
              </a>
            </div>
          </>
        )}

        {mode === "master" && (
          <>
            <p className="text-sm text-muted text-center">Emergency Recovery</p>

            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-900">
              <p className="font-medium mb-1">What this does</p>
              <p className="text-xs">
                Your data is kept. The owner account becomes <strong>admin</strong> and both the
                owner password and the database password are set to the recovery code. Change them
                in Settings right after logging in.
              </p>
            </div>

            <form onSubmit={handleMasterRecovery} className="w-full flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-ink">Recovery Code</label>
                <div className="relative mt-1">
                  <input
                    type={showCode ? "text" : "password"}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded text-sm"
                    placeholder="Enter the recovery code"
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    title={showCode ? "Hide code" : "Show code"}
                  >
                    {showCode ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="w-full flex flex-col gap-2">
                <ClayButton type="submit" className="w-full" disabled={loading}>
                  {loading ? "Recovering..." : "Recover Owner Access"}
                </ClayButton>
                <ClayButton type="button" onClick={() => goTo("choose")} className="w-full" variant="secondary">
                  Back
                </ClayButton>
              </div>
            </form>
          </>
        )}

        {mode === "master-done" && (
          <>
            <div className="text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm font-medium text-ink mb-2">Owner Access Restored</p>
              <p className="text-xs text-muted mb-2">{masterMessage}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800 text-left">
                <p className="font-medium mb-1">⚠️ Do this now:</p>
                <p>
                  1. Login as <strong>admin</strong> with the recovery code as password.
                  <br />
                  2. Go to Settings and set a new owner password.
                </p>
              </div>
            </div>
            <a href="/login" className="w-full">
              <ClayButton className="w-full">Go to Login</ClayButton>
            </a>
          </>
        )}

        {mode === "reset-password" && (
          <>
            <p className="text-sm text-muted text-center">Enter Database Password</p>

            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
              <p className="text-blue-900">
                To reset the database, you must enter the encryption password you set during
                initial setup.
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
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
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
                <ClayButton type="button" onClick={() => goTo("choose")} className="w-full" variant="secondary">
                  Back
                </ClayButton>
              </div>
            </form>
          </>
        )}

        {mode === "reset-confirm" && (
          <>
            <p className="text-sm text-muted text-center">Reset Database Setup</p>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
              <p className="font-medium text-yellow-900 mb-2">⚠️ Warning</p>
              <p className="text-yellow-800 mb-3">
                This will delete your database and all data. You&apos;ll need to run setup again
                from the beginning.
              </p>
              <p className="text-yellow-700 text-xs">Make sure you back up any important data first!</p>
            </div>

            <div className="w-full flex flex-col gap-3">
              <ClayButton
                onClick={handleReset}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Yes, Reset Database"}
              </ClayButton>

              <ClayButton type="button" onClick={() => goTo("choose")} className="w-full" variant="secondary">
                Cancel, Go Back
              </ClayButton>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          </>
        )}

        {mode === "reset-done" && (
          <>
            <div className="text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm font-medium text-ink mb-2">Database Reset</p>
              <p className="text-xs text-muted mb-6">
                Your database has been deleted. You can now set it up again.
              </p>
            </div>

            <a href="/setup" className="w-full">
              <ClayButton className="w-full">Start Setup Again</ClayButton>
            </a>
          </>
        )}
      </ClayCard>
    </div>
  );
}
