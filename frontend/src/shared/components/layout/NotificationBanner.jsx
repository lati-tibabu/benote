function NotificationBanner({
    notification,
    onDismiss,
    onMarkAsRead,
    onOpenNotifications,
}) {
    if (!notification) return null;

    return (
        <div className="fixed top-4 right-4 z-50 w-[min(92vw,420px)] rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-lg">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        New notification
                    </p>
                    <p className="mt-1 text-sm font-medium break-words">
                        {notification.message ||
                            notification.title ||
                            "You have a new notification."}
                    </p>
                </div>
                <button
                    className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    onClick={onDismiss}
                    aria-label="Dismiss notification"
                >
                    Close
                </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    onClick={onMarkAsRead}
                >
                    Mark as read
                </button>
                <button
                    className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                    onClick={onOpenNotifications}
                >
                    Open notifications
                </button>
            </div>
        </div>
    );
}

export default NotificationBanner;
