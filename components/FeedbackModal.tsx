"use client";

import { useState } from "react";
import { ClayButton } from "./clay/ClayButton";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [issueType, setIssueType] = useState<"bug" | "feature" | "general">("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueType, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send feedback");
      } else {
        setSuccess(true);
        setSubject("");
        setMessage("");
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="bg-canvas rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Send Feedback</h2>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-green-700 font-medium">Thank you for your feedback!</p>
            <p className="text-sm text-muted mt-1">We'll review it and get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="bug">🐛 Bug Report</option>
                <option value="feature">✨ Feature Request</option>
                <option value="general">💬 General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the issue or suggestion in detail..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-32 resize-none"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-ink border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <ClayButton
                type="submit"
                disabled={loading || !subject || !message}
                className="flex-1"
              >
                {loading ? "Sending..." : "Send Feedback"}
              </ClayButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
