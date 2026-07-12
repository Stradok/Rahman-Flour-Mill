"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";

export default function SetupPage() {
  const [step, setStep] = useState<"password" | "owner" | "review">("password");
  const [dbPassword, setDbPassword] = useState("");
  const [dbPasswordConfirm, setDbPasswordConfirm] = useState("");
  const [showDbPassword, setShowDbPassword] = useState(false);
  const [showDbPasswordConfirm, setShowDbPasswordConfirm] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState("");
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [showOwnerPasswordConfirm, setShowOwnerPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!dbPassword || !dbPasswordConfirm) {
      setError("Both password fields are required");
      return;
    }

    if (dbPassword !== dbPasswordConfirm) {
      setError("Passwords do not match");
      return;
    }

    if (dbPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setStep("owner");
  };

  const handleOwnerStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!ownerName || !ownerUsername || !ownerPassword) {
      setError("All fields are required");
      return;
    }

    if (ownerPassword !== ownerPasswordConfirm) {
      setError("Passwords do not match");
      return;
    }

    if (ownerPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setStep("review");
  };

  const handleConfirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dbPassword,
          ownerName,
          ownerUsername,
          ownerPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Setup failed");
      }

      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ClayCard accent="violet" className="flex flex-col items-center gap-6 max-w-sm w-full">
        <h1 className="font-heading font-black text-2xl text-ink">
          Al Rehman <span className="text-violet">Flour Mills</span>
        </h1>
        <p className="text-sm text-muted text-center">First-time setup</p>

        {step === "password" ? (
          <form onSubmit={handlePasswordStep} className="w-full flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-ink">Database Password</label>
              <div className="relative">
                <input
                  type={showDbPassword ? "text" : "password"}
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2 pr-10 border border-gray-300 rounded text-sm"
                  placeholder="Enter encryption password"
                />
                <button
                  type="button"
                  onClick={() => setShowDbPassword(!showDbPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  title={showDbPassword ? "Hide password" : "Show password"}
                >
                  {showDbPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <p className="text-xs text-muted mt-1">
                This password encrypts your database file. Keep it safe — if lost, data cannot be recovered.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Confirm Password</label>
              <div className="relative">
                <input
                  type={showDbPasswordConfirm ? "text" : "password"}
                  value={dbPasswordConfirm}
                  onChange={(e) => setDbPasswordConfirm(e.target.value)}
                  className="w-full mt-1 px-3 py-2 pr-10 border border-gray-300 rounded text-sm"
                  placeholder="Confirm encryption password"
                />
                <button
                  type="button"
                  onClick={() => setShowDbPasswordConfirm(!showDbPasswordConfirm)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  title={showDbPasswordConfirm ? "Hide password" : "Show password"}
                >
                  {showDbPasswordConfirm ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <ClayButton type="submit" className="w-full">
              Next
            </ClayButton>
          </form>
        ) : step === "review" ? (
          <form onSubmit={handleConfirmSetup} className="w-full flex flex-col gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h2 className="font-bold text-blue-900 mb-3">Review Setup Details</h2>
              <div className="space-y-2 text-sm text-blue-800">
                <p><span className="font-medium">Owner Name:</span> {ownerName}</p>
                <p><span className="font-medium">Username:</span> {ownerUsername}</p>
                <p className="text-xs text-blue-700 mt-3 border-t border-blue-200 pt-2">
                  ⚠️ Make sure you remember your passwords. They cannot be recovered if lost.
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <ClayButton
                type="button"
                onClick={() => {
                  setStep("owner");
                  setError("");
                }}
                className="flex-1"
                variant="secondary"
              >
                Back
              </ClayButton>
              <ClayButton type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating..." : "Confirm & Create"}
              </ClayButton>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOwnerStep} className="w-full flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-ink">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Username</label>
              <input
                type="text"
                value={ownerUsername}
                onChange={(e) => setOwnerUsername(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Login username"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Password</label>
              <div className="relative">
                <input
                  type={showOwnerPassword ? "text" : "password"}
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2 pr-10 border border-gray-300 rounded text-sm"
                  placeholder="Login password"
                />
                <button
                  type="button"
                  onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  title={showOwnerPassword ? "Hide password" : "Show password"}
                >
                  {showOwnerPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Confirm Password</label>
              <div className="relative">
                <input
                  type={showOwnerPasswordConfirm ? "text" : "password"}
                  value={ownerPasswordConfirm}
                  onChange={(e) => setOwnerPasswordConfirm(e.target.value)}
                  className="w-full mt-1 px-3 py-2 pr-10 border border-gray-300 rounded text-sm"
                  placeholder="Confirm login password"
                />
                <button
                  type="button"
                  onClick={() => setShowOwnerPasswordConfirm(!showOwnerPasswordConfirm)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  title={showOwnerPasswordConfirm ? "Hide password" : "Show password"}
                >
                  {showOwnerPasswordConfirm ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <ClayButton
                type="button"
                onClick={() => {
                  setStep("password");
                  setError("");
                }}
                className="flex-1"
                variant="secondary"
              >
                Back
              </ClayButton>
              <ClayButton type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating..." : "Create Database"}
              </ClayButton>
            </div>
          </form>
        )}
      </ClayCard>
    </div>
  );
}
