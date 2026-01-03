import { useState, useEffect } from "react";
import { X } from "lucide-react";

export interface Reminder {
  id: string;
  description: string;
  createdAt: Date;
}

interface ReminderBannerProps {
  reminder: Reminder | null;
  onDismiss: () => void;
}

/**
 * ReminderBanner component that displays at the top of the page
 * Shows task reminders with a dismiss button
 */
export function ReminderBanner({ reminder, onDismiss }: ReminderBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show banner when reminder arrives
  useEffect(() => {
    if (reminder) {
      setIsVisible(true);
    }
  }, [reminder]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Small delay before calling onDismiss to allow animation
    setTimeout(onDismiss, 300);
  };

  if (!reminder || !isVisible) {
    return null;
  }

  return (
    <div
      className={`sticky top-0 left-0 right-0 z-40 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-900 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-full px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-6 w-6">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-label="Reminder notification"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 1118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Task Reminder
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 truncate">
              {reminder.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 inline-flex text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none transition-colors"
          aria-label="Dismiss reminder"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
