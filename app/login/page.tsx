"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
      } else if (result?.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ClayCard accent="violet" className="flex flex-col items-center gap-6 max-w-sm w-full">
        <h1 className="font-heading font-black text-2xl text-ink">
          Al Rehman <span className="text-violet">Flour Mills</span>
        </h1>
        <p className="text-sm text-muted">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-ink">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Your username"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Your password"
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <ClayButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </ClayButton>
        </form>
      </ClayCard>
    </div>
  );
}
