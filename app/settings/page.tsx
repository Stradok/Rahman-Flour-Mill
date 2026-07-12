'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayCard } from '@/components/clay/ClayCard';
import { FeedbackModal } from '@/components/FeedbackModal';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<'general' | 'staff'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | 'logout' | 'reset'>(null);

  // General settings
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [sessionWarning, setSessionWarning] = useState(5);

  // Staff management
  const [staff, setStaff] = useState<any[]>([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [resetStaffId, setResetStaffId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  // Permissions check
  if (session?.user && (session.user as any).role !== 'owner') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-muted mt-2">Only owners can access settings.</p>
      </div>
    );
  }

  useEffect(() => {
    loadSettings();
    loadStaff();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSessionTimeout(data.sessionTimeoutMinutes || 30);
      setSessionWarning(data.sessionWarningMinutes || 5);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const loadStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
    }
  };

  const handleUpdateSettings = async () => {
    if (sessionWarning >= sessionTimeout) {
      setError('Warning time must be less than timeout');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionTimeoutMinutes: sessionTimeout,
          sessionWarningMinutes: sessionWarning,
        }),
      });

      if (res.ok) {
        setSuccess('Settings updated successfully');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update settings');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaffName || !newStaffUsername || !newStaffPassword) {
      setError('All fields required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName,
          username: newStaffUsername,
          tempPassword: newStaffPassword,
        }),
      });

      if (res.ok) {
        setSuccess('Staff member added');
        setNewStaffName('');
        setNewStaffUsername('');
        setNewStaffPassword('');
        loadStaff();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add staff');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/staff/${staffId}`, { method: 'DELETE' });

      if (res.ok) {
        setSuccess('Staff member removed');
        loadStaff();
      } else {
        setError('Failed to delete staff');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (staffId: string) => {
    if (!resetPassword) {
      setError('Enter new password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPassword }),
      });

      if (res.ok) {
        setSuccess('Password updated');
        setResetStaffId(null);
        setResetPassword('');
      } else {
        setError('Failed to update password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setConfirmAction(null);
    setShowConfirmDialog(false);
    await signOut({ callbackUrl: "/login" });
  };

  const handleResetDatabase = () => {
    setConfirmAction(null);
    setShowConfirmDialog(false);
    router.push("/recover");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-canvas rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold mb-4">
              {confirmAction === "logout" ? "Confirm Logout" : "Confirm Database Reset"}
            </h3>
            <p className="text-sm text-muted mb-6">
              {confirmAction === "logout"
                ? "Are you sure you want to logout?"
                : "This will take you to the database recovery page. You'll need the database password to reset it."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-ink border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction === "logout" ? handleLogout : handleResetDatabase}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded ${
                  confirmAction === "logout"
                    ? "bg-violet hover:bg-violet/90"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmAction === "logout" ? "Yes, Logout" : "Go to Recovery"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFeedbackOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
          >
            📧 Send Feedback
          </button>
          <button
            onClick={() => {
              setConfirmAction("logout");
              setShowConfirmDialog(true);
            }}
            className="px-4 py-2 text-sm font-medium bg-red-50 text-red-700 rounded hover:bg-red-100"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setTab('general')}
          className={`px-4 py-2 font-medium ${
            tab === 'general'
              ? 'text-violet border-b-2 border-violet'
              : 'text-muted hover:text-ink'
          }`}
        >
          Session & Security
        </button>
        <button
          onClick={() => setTab('staff')}
          className={`px-4 py-2 font-medium ${
            tab === 'staff'
              ? 'text-violet border-b-2 border-violet'
              : 'text-muted hover:text-ink'
          }`}
        >
          Staff Management
        </button>
      </div>

      {/* Messages */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">{success}</div>}

      {/* General Settings */}
      {tab === 'general' && (
        <div className="space-y-6">
          <ClayCard accent="violet" className="p-6">
            <h2 className="text-xl font-bold mb-4">Session Timeout Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-muted mt-1">
                  User will be automatically logged out after this duration of inactivity.
                  (5 - 480 minutes, 8 hours max)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Show Warning After (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max={sessionTimeout - 1}
                  value={sessionWarning}
                  onChange={(e) => setSessionWarning(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-muted mt-1">
                  Show countdown warning this many minutes before timeout.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-800">
                <strong>Example:</strong> If timeout is 30 min and warning is 5 min, user will see
                a warning at 25 minutes of inactivity. They can stay logged in by moving the mouse
                or using the keyboard.
              </div>

              <ClayButton
                onClick={handleUpdateSettings}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </ClayButton>
            </div>
          </ClayCard>

          <ClayCard accent="violet" className="p-6">
            <h2 className="text-xl font-bold mb-4">Application Version</h2>
            <p className="text-sm text-muted mb-4">
              Version <strong>0.1.0</strong> (Beta)
            </p>
            <ClayButton
              onClick={async () => {
                try {
                  const res = await fetch('/api/check-updates');
                  const data = await res.json();
                  if (data.isUpdateAvailable) {
                    alert(
                      `New version ${data.latestVersion} available!\n\nDownload: ${data.downloadUrl}`
                    );
                  } else {
                    alert('You are running the latest version.');
                  }
                } catch (err) {
                  alert('Failed to check for updates');
                }
              }}
              className="w-full"
            >
              Check for Updates
            </ClayButton>
          </ClayCard>

          <ClayCard accent="pink" className="p-6">
            <h2 className="text-xl font-bold mb-4">Danger Zone</h2>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-800">
              <p className="font-medium mb-1">⚠️ Reset Database</p>
              <p className="text-xs">This will delete all your data and require setup from scratch. Use only if you've lost the database password or want to completely reset.</p>
            </div>
            <ClayButton
              onClick={() => {
                setConfirmAction("reset");
                setShowConfirmDialog(true);
              }}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Reset Database
            </ClayButton>
          </ClayCard>
        </div>
      )}

      {/* Staff Management */}
      {tab === 'staff' && (
        <div className="space-y-6">
          {/* Add Staff */}
          <ClayCard accent="violet" className="p-6">
            <h2 className="text-xl font-bold mb-4">Add Staff Member</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Username"
                value={newStaffUsername}
                onChange={(e) => setNewStaffUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="password"
                placeholder="Temporary Password"
                value={newStaffPassword}
                onChange={(e) => setNewStaffPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />

              <ClayButton
                onClick={handleAddStaff}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Adding...' : 'Add Staff Member'}
              </ClayButton>
            </div>
          </ClayCard>

          {/* Staff List */}
          <ClayCard accent="violet" className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Staff Members ({staff.length})
            </h2>

            {staff.length === 0 ? (
              <p className="text-muted text-sm">No staff members added yet.</p>
            ) : (
              <div className="space-y-3">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="border border-gray-200 rounded p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted">@{member.username}</p>
                    </div>

                    <div className="flex gap-2">
                      {resetStaffId === member.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="password"
                            placeholder="New password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleResetPassword(member.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setResetStaffId(null);
                              setResetPassword('');
                            }}
                            className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setResetStaffId(member.id)}
                            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(member.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ClayCard>
        </div>
      )}
    </div>
  );
}
