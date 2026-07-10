'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SessionTimeoutWarning() {
  const { data: session } = useSession();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning at 5 minutes

  useEffect(() => {
    if (!session) {
      setShowWarning(false);
      return;
    }

    let lastActivityTime = Date.now();
    let timeoutId: NodeJS.Timeout;
    let countdownId: NodeJS.Timeout;

    const resetTimer = () => {
      lastActivityTime = Date.now();
      setShowWarning(false);
      clearTimeout(timeoutId);
      clearInterval(countdownId);

      // Set new timeout
      timeoutId = setTimeout(() => {
        // Session will expire soon
        countdownId = setInterval(() => {
          const elapsed = Date.now() - lastActivityTime;
          const remaining = SESSION_TIMEOUT - elapsed;
          setTimeLeft(Math.max(0, remaining));

          if (remaining <= 0) {
            setShowWarning(false);
            clearInterval(countdownId);
          }
        }, 1000);

        setShowWarning(true);
      }, SESSION_TIMEOUT - WARNING_TIME);
    };

    // Activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      clearTimeout(timeoutId);
      clearInterval(countdownId);
    };
  }, [session]);

  if (!session || !showWarning) {
    return null;
  }

  const minutes = Math.floor((timeLeft || 0) / 60000);
  const seconds = Math.floor(((timeLeft || 0) % 60000) / 1000);

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-lg z-50 max-w-sm">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800">
            ⏱️ Session Expiring Soon
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            Your session will expire in{' '}
            <span className="font-bold">
              {minutes}:{String(seconds).padStart(2, '0')}
            </span>
            {' '}minutes due to inactivity.
          </p>
          <p className="text-xs text-yellow-600 mt-2">
            Move your mouse or click to stay logged in.
          </p>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="text-yellow-400 hover:text-yellow-600 ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
