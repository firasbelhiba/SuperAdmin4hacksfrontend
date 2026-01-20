"use client";

import { useState, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNotifications } from "@/hooks/useNotifications";

// Notification type badge colors
const TYPE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  TEAM_INVITE: { bg: "bg-[#12B76A]", text: "text-white" },
  TEAM_MEMBER_REMOVED: { bg: "bg-[#FF4B1E]", text: "text-white" },
  TEAM_JOIN_REQUEST: { bg: "bg-[#FFBD12]", text: "text-[#18191F]" },
  HACKATHON_UPDATE: { bg: "bg-[#6366F1]", text: "text-white" },
  DEFAULT: { bg: "bg-[#FFBD12]", text: "text-[#18191F]" },
};

// Format notification type for display
function formatNotificationType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

// Format relative time
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// Get badge colors for notification type
function getTypeBadgeColors(type: string) {
  return TYPE_BADGE_COLORS[type] || TYPE_BADGE_COLORS.DEFAULT;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markingAsRead,
    markingAllAsRead,
    markAsRead,
    markAllAsRead,
    refresh,
    loadMore,
    hasMore,
  } = useNotifications(10);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleNotificationClick = useCallback(
    async (notificationId: string, isRead: boolean) => {
      if (!isRead && !markingAsRead.has(notificationId)) {
        await markAsRead(notificationId);
      }
    },
    [markAsRead, markingAsRead]
  );

  const handleMarkAllAsRead = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!markingAllAsRead && unreadCount > 0) {
        await markAllAsRead();
      }
    },
    [markAllAsRead, markingAllAsRead, unreadCount]
  );

  return (
    <div className="relative">
      <button
        className="neo-icon-btn lg:h-11 lg:w-11"
        onClick={toggleDropdown}
      >
        {/* Unread indicator dot */}
        <span
          className={`absolute -right-0.5 -top-0.5 z-10 h-3 w-3 rounded-md bg-[#FFBD12] border-2 border-[#18191F] dark:border-brand-700 ${
            unreadCount === 0 ? "hidden" : "flex"
          }`}
        />
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-60 mt-3 flex h-[480px] w-[350px] flex-col rounded-lg border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] sm:w-[361px] lg:right-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#FFFBEA] dark:bg-gray-800 border-b-2 border-[#18191F] dark:border-brand-700">
          <div className="flex items-center gap-2">
            <h5 className="text-lg font-bold text-[#18191F] dark:text-white">Notifications</h5>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-[#FFBD12] border border-[#18191F] dark:border-brand-700 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Mark all as read button */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead}
                className="text-xs font-medium text-[#18191F]/70 dark:text-gray-400 hover:text-[#18191F] dark:hover:text-white transition-colors disabled:opacity-50"
                title="Mark all as read"
              >
                {markingAllAsRead ? "..." : "Mark all read"}
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-900 border-2 border-[#18191F] dark:border-brand-700 rounded-md shadow-[2px_2px_0_0_#18191F] dark:shadow-[2px_2px_0_0_var(--color-brand-700)] hover:shadow-[1px_1px_0_0_#18191F] dark:hover:shadow-[1px_1px_0_0_var(--color-brand-700)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-[#18191F] dark:text-white"
            >
              <svg
                className="fill-current"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Notification Items */}
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar flex-1">
          {/* Loading State */}
          {loading && (
            <li className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#FFBD12] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[#18191F]/50 dark:text-gray-400">
                  Loading notifications...
                </span>
              </div>
            </li>
          )}

          {/* Error State */}
          {error && !loading && (
            <li className="flex items-center justify-center py-12 px-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 flex items-center justify-center bg-[#FF4B1E]/10 dark:bg-red-900/30 rounded-full">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="#FF4B1E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm text-[#18191F]/70">{error}</span>
                <button
                  onClick={() => refresh()}
                  className="text-sm font-medium text-[#18191F] hover:underline"
                >
                  Try again
                </button>
              </div>
            </li>
          )}

          {/* Empty State */}
          {!loading && !error && notifications.length === 0 && (
            <li className="flex items-center justify-center py-12 px-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 flex items-center justify-center bg-[#FFBD12]/20 rounded-full">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                      stroke="#18191F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                      stroke="#18191F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm text-[#18191F]/70">
                  No notifications yet
                </span>
                <span className="text-xs text-[#18191F]/50">
                  We&apos;ll notify you when something happens
                </span>
              </div>
            </li>
          )}

          {/* Notification List */}
          {!loading &&
            !error &&
            notifications.map((notification, index) => {
              const badgeColors = getTypeBadgeColors(notification.type);
              const isLast = index === notifications.length - 1;
              const isMarking = markingAsRead.has(notification.id);

              return (
                <li key={notification.id}>
                  <DropdownItem
                    onItemClick={() => {
                      handleNotificationClick(notification.id, notification.isRead);
                      closeDropdown();
                    }}
                    className={`flex gap-3 px-4 py-3 ${
                      !isLast ? "border-b-2 border-[#18191F] dark:border-brand-700" : ""
                    } hover:bg-[#FFBD12]/30 dark:hover:bg-brand-700/20 transition-colors duration-150 ${
                      !notification.isRead ? "bg-[#FFFBEA] dark:bg-brand-700/10" : ""
                    } ${isMarking ? "opacity-50" : ""}`}
                  >
                    {/* Unread indicator */}
                    <div className="flex items-start pt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          notification.isRead
                            ? "bg-transparent"
                            : "bg-[#FFBD12] border border-[#18191F] dark:border-brand-700"
                        }`}
                      />
                    </div>

                    <span className="block flex-1 min-w-0">
                      <span className="mb-1 block text-theme-sm text-[#18191F] dark:text-white line-clamp-2">
                        {notification.content}
                      </span>

                      <span className="flex items-center gap-2 text-[#18191F]/50 dark:text-gray-400 text-theme-xs">
                        <span
                          className={`px-1.5 py-0.5 ${badgeColors.bg} rounded ${badgeColors.text} font-medium text-[10px]`}
                        >
                          {formatNotificationType(notification.type)}
                        </span>
                        <span>{formatTimeAgo(notification.createdAt)}</span>
                      </span>
                    </span>
                  </DropdownItem>
                </li>
              );
            })}

          {/* Load More */}
          {!loading && !error && hasMore && (
            <li className="py-2 px-4">
              <button
                onClick={loadMore}
                className="w-full text-center text-sm font-medium text-[#18191F]/70 hover:text-[#18191F] transition-colors py-2"
              >
                Load more
              </button>
            </li>
          )}
        </ul>

        {/* Footer - Refresh Button */}
        <div className="p-3 border-t-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900">
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="block w-full px-4 py-2.5 text-sm font-bold text-center text-[#18191F] dark:text-white bg-[#FFBD12] dark:bg-brand-700 border-2 border-[#18191F] dark:border-brand-700 rounded-lg shadow-[2px_2px_0_0_#18191F] dark:shadow-[2px_2px_0_0_var(--color-brand-700)] hover:shadow-[1px_1px_0_0_#18191F] dark:hover:shadow-[1px_1px_0_0_var(--color-brand-700)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Refreshing..." : "Refresh Notifications"}
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
