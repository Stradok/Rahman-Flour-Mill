"use client";

import { useState } from "react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";

export default function SetupPage() {
  const [step, setStep] = useState<"password" | "owner">("password");
  const [dbPassword, setDbPassword] = useState("");
  const [dbPasswordConfirm, setDbPasswordConfirm] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState("");
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

  const handleOwnerStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!ownerName || !ownerUsername || !ownerPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (ownerPassword !== ownerPasswordConfirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (ownerPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

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
              <input
                type="password"
                value={dbPassword}
                onChange={(e) => setDbPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Enter encryption password"
              />
              <p className="text-xs text-muted mt-1">
                This password encrypts your database file. Keep it safe — if lost, data cannot be recovered.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Confirm Password</label>
              <input
                type="password"
                value={dbPasswordConfirm}
                onChange={(e) => setDbPasswordConfirm(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Confirm encryption password"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <ClayButton type="submit" className="w-full">
              Next
            </ClayButton>
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
              <input
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Login password"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Confirm Password</label>
              <input
                type="password"
                value={ownerPasswordConfirm}
                onChange={(e) => setOwnerPasswordConfirm(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Confirm login password"
              />
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
