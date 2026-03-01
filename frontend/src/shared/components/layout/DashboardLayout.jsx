import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import { PiBellRingingDuotone, PiChatCircle } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import {
    AiOutlineInfoCircle,
    AiOutlineLeft,
    AiOutlineMoon,
    AiOutlineRight,
    AiOutlineClose,
    AiOutlineSun,
} from "react-icons/ai";
import Sidebar from "./Sidebar";
import NotificationBanner from "./NotificationBanner";
import { SearchModal } from "../../../features/search";
import { AiOverviewModal } from "../../../features/ai";
import Chatbot from "../../../features/ai/pages/AskAI/contents/chatbot";
import { sendBrowserNotification } from "../../../utils/sendBrowserNotification";
import { setWorkspaceRecent } from "../../../redux/slices/workspaceSlice";
import { setTheme } from "../../../redux/slices/themeSlice";

const NOTIFICATION_SNOOZE_MS = 3 * 60 * 1000;
const LAST_SHOWN_NOTIFICATION_KEY = "last_shown_notification_id";
const NOTIFICATION_SNOOZE_UNTIL_KEY = "notification_banner_snooze_until";

function DashboardLayout() {
    const apiURL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("jwt");
    const header = {
        authorization: `Bearer ${token}`,
    };

    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [latestNotification, setLatestNotification] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [collapsedNav, setCollapsedBar] = useState(false);
    const [notificationPopping, setNotificationPopping] = useState(false);
    const [searchOpened, setSearchOpened] = useState(false);
    const [aiOverviewOpen, setAiOverviewOpen] = useState(false);
    const [isQuickAiOpen, setIsQuickAiOpen] = useState(false);
    const [aiSummary, setAiSummary] = useState("");
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 640);
    const dispatch = useDispatch();
    const quickAiRef = useRef(null);
    const quickAiButtonRef = useRef(null);
    const lastShownNotificationIdRef = useRef(
        localStorage.getItem(LAST_SHOWN_NOTIFICATION_KEY) || ""
    );
    const recentWorkspaces =
        useSelector((state) => state.workspace.workspaceRecent) || [];
    const theme = useSelector((state) => state.theme.theme);

    const location = useLocation();
    const navigate = useNavigate();

    const loc = location.pathname.split("/").slice(2);
    const currentSection = loc.length
        ? loc[loc.length - 1].replace(/-/g, " ")
        : "home";
    const latestNotificationText =
        latestNotification?.message ||
        latestNotification?.title ||
        "No new notifications right now.";
    const latestNotificationTime = latestNotification?.createdAt
        ? new Date(latestNotification.createdAt).toLocaleString()
        : "Up to date";

    const getNotificationSnoozeUntil = () =>
        Number(localStorage.getItem(NOTIFICATION_SNOOZE_UNTIL_KEY) || "0");

    const setNotificationSnoozeUntil = (timestampMs) => {
        localStorage.setItem(NOTIFICATION_SNOOZE_UNTIL_KEY, String(timestampMs));
    };

    const rememberLastShownNotification = (id) => {
        const idValue = String(id || "");
        lastShownNotificationIdRef.current = idValue;
        localStorage.setItem(LAST_SHOWN_NOTIFICATION_KEY, idValue);
    };

    const shouldPresentNotification = (notification) => {
        if (!notification?.id) return false;
        if (location.pathname.includes("/app/notifications")) return false;
        if (Date.now() < getNotificationSnoozeUntil()) return false;

        const incomingId = String(notification.id);
        return incomingId !== lastShownNotificationIdRef.current;
    };

    const handleNavigation = (link, workspaceId) => () => {
        navigate(`/app/workspace/open/${workspaceId}/${link}`);
    };

    const onPage = (link) => location.pathname.includes(link);

    const toggleMobileNav = () => {
        setIsMobileNavOpen(!isMobileNavOpen);
        if (!isMobileNavOpen) {
            setCollapsedBar(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        localStorage.removeItem("jwt_expiration");
        navigate("/auth/login");
    };

    const handleCollapseBar = () => {
        setCollapsedBar((prev) => !prev);
    };

    const isDarkTheme = theme === "dark";
    const handleThemeToggle = () => {
        dispatch(setTheme(isDarkTheme ? "light" : "dark"));
    };

    // Fetch unread notification count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await fetch(
                    `${apiURL}/api/notifications/unread-count`,
                    {
                        headers: header,
                    }
                );
                const data = await response.json();
                setUnreadCount(data.unreadCount || 0);
            } catch (error) {
                console.error("Error fetching unread notifications:", error);
            }
        };

        fetchUnreadCount();
        const intervalId = setInterval(fetchUnreadCount, 15000);
        return () => clearInterval(intervalId);
    }, []);

    // Fetch recent workspaces for sidebar quick list
    useEffect(() => {
        const fetchRecentWorkspaces = async () => {
            if (recentWorkspaces.length) return;
            try {
                const response = await fetch(`${apiURL}/api/workspaces/?home=true`, {
                    method: "GET",
                    headers: header,
                });
                if (!response.ok) throw new Error("Failed to fetch recent workspaces");
                const data = await response.json();
                dispatch(setWorkspaceRecent(Array.isArray(data) ? data : []));
            } catch (error) {
                console.error("Error fetching recent workspaces:", error);
            }
        };

        fetchRecentWorkspaces();
    }, [apiURL, token, dispatch]);

    // Fetch latest notification and only surface unseen ones.
    useEffect(() => {
        const fetchLatestNotification = async () => {
            try {
                const response = await fetch(`${apiURL}/api/notifications?latest=1`, {
                    headers: header,
                });

                if (response.status === 204) {
                    setLatestNotification(null);
                    setNotificationPopping(false);
                    return;
                }

                const data = await response.json();
                setLatestNotification(data);
                if (shouldPresentNotification(data)) {
                    rememberLastShownNotification(data.id);
                    setNotificationPopping(true);
                }
            } catch (error) {
                console.error("Error fetching latest notification:", error);
            }
        };

        fetchLatestNotification();
        const intervalId = setInterval(fetchLatestNotification, 20000);
        return () => clearInterval(intervalId);
    }, [apiURL, token, unreadCount, location.pathname]);

    // Activity heartbeat for presence tracking.
    useEffect(() => {
        if (!token) return undefined;

        const sendHeartbeat = async () => {
            try {
                await fetch(`${apiURL}/api/users/activity/heartbeat`, {
                    method: "POST",
                    headers: header,
                });
            } catch (error) {
                console.error("Heartbeat failed:", error);
            }
        };

        sendHeartbeat();
        const heartbeatInterval = setInterval(sendHeartbeat, 60000);
        return () => clearInterval(heartbeatInterval);
    }, [apiURL, token]);

    const handleDismissNotification = (snoozeMs = NOTIFICATION_SNOOZE_MS) => {
        if (snoozeMs > 0) {
            setNotificationSnoozeUntil(Date.now() + snoozeMs);
        }
        setNotificationPopping(false);
    };

    const handleMarkNotificationAsRead = async () => {
        if (!latestNotification?.id) {
            handleDismissNotification(0);
            return;
        }
        try {
            const response = await fetch(
                `${apiURL}/api/notifications/${latestNotification.id}/read`,
                {
                    method: "PUT",
                    headers: header,
                }
            );
            if (!response.ok) {
                throw new Error("Failed to mark notification as read");
            }
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        } finally {
            handleDismissNotification(0);
        }
    };

    const handleOpenNotifications = () => {
        setNotificationPopping(false);
        navigate("/app/notifications");
    };

    // Send browser notifications only when tab is in background.
    useEffect(() => {
        if (latestNotification && notificationPopping && document.hidden) {
            sendBrowserNotification(
                latestNotification.message,
                latestNotification.type
            );
        }
    }, [latestNotification, notificationPopping]);

    // Handle AI overview
    useEffect(() => {
        if (aiOverviewOpen) {
            setAiSummary("Generating summary...");
            setTimeout(() => {
                setAiSummary(
                    "This is your AI-generated productivity summary.\\n\\n- You have 3 tasks due today.\\n- Your focus time is up 20% this week.\\n- Team collaboration is active in 2 workspaces.\\n\\nKeep up the great work!"
                );
            }, 1200);
        }
    }, [aiOverviewOpen]);

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setShowSidebar(false);
            } else {
                setShowSidebar(true);
                setIsMobileNavOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!isQuickAiOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsQuickAiOpen(false);
            }
        };

        const handleClickOutside = (event) => {
            if (!quickAiRef.current) return;
            if (quickAiButtonRef.current?.contains(event.target)) return;
            if (!quickAiRef.current.contains(event.target)) {
                setIsQuickAiOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isQuickAiOpen]);

    return (
        <div className="h-screen min-h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100 text-gray-900">
            <div className="w-full flex-1 flex flex-col sm:flex-row overflow-hidden">
                {/* Hamburger for mobile */}
                {!showSidebar && !isMobileNavOpen && (
                    <button
                        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-gray-900 text-white shadow-lg shadow-black/20 sm:hidden"
                        onClick={toggleMobileNav}
                        aria-label="Open sidebar"
                    >
                        <HiMenu size={28} />
                    </button>
                )}

                {/* Mobile sidebar backdrop */}
                {isMobileNavOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black bg-opacity-30 sm:hidden"
                        onClick={toggleMobileNav}
                        aria-label="Close sidebar backdrop"
                    />
                )}

                {/* Sidebar */}
                {(showSidebar || isMobileNavOpen) && (
                    <Sidebar
                        showSidebar={showSidebar}
                        isMobileNavOpen={isMobileNavOpen}
                        collapsedNav={collapsedNav}
                        recentWorkspaces={recentWorkspaces}
                        loc={loc}
                        unreadCount={unreadCount}
                        handleCollapseBar={handleCollapseBar}
                        toggleMobileNav={toggleMobileNav}
                        setIsMobileNavOpen={setIsMobileNavOpen}
                        setSearchOpened={setSearchOpened}
                        handleNavigation={handleNavigation}
                        onPage={onPage}
                        handleLogout={handleLogout}
                    />
                )}

                {/* Modals */}
                <SearchModal
                    open={searchOpened}
                    onClose={() => setSearchOpened(false)}
                />
                <AiOverviewModal
                    open={aiOverviewOpen}
                    onClose={() => setAiOverviewOpen(false)}
                />

                {/* Main Content */}
                <main className="w-full flex flex-col h-screen min-h-0 overflow-y-auto scrollbar-hide bg-transparent">
                    <button
                        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-xl border border-r-0 border-gray-300 bg-white px-2 py-3 text-gray-700 shadow-sm hover:bg-gray-50"
                        onClick={() => setIsRightPanelOpen((prev) => !prev)}
                        aria-label={
                            isRightPanelOpen
                                ? "Collapse information panel"
                                : "Expand information panel"
                        }
                        title={
                            isRightPanelOpen
                                ? "Hide quick info"
                                : "Show quick info"
                        }
                    >
                        {isRightPanelOpen ? <AiOutlineRight size={16} /> : <AiOutlineLeft size={16} />}
                    </button>

                    <aside
                        className={`fixed right-0 top-0 z-40 h-screen w-[320px] max-w-[90vw] border-l border-gray-200 bg-white/95 backdrop-blur-sm shadow-xl transition-transform duration-300 ${
                            isRightPanelOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                        aria-hidden={!isRightPanelOpen}
                    >
                        <div className="h-full overflow-y-auto p-4 pt-20">
                            <div className="flex items-center gap-2">
                                <AiOutlineInfoCircle className="text-gray-500" />
                                <h3 className="text-sm font-semibold text-gray-800">
                                    Quick Information
                                </h3>
                                <button
                                    className="ml-auto rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    onClick={() => setIsRightPanelOpen(false)}
                                    aria-label="Close information panel"
                                    title="Close panel"
                                >
                                    <AiOutlineClose size={16} />
                                </button>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Current Section
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-800 capitalize">
                                        {currentSection}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Unread Notifications
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                        {unreadCount}
                                    </p>
                                    <button
                                        className="mt-2 text-xs font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900"
                                        onClick={() => navigate("/app/notifications")}
                                    >
                                        Open notification center
                                    </button>
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Latest Notification
                                    </p>
                                    <p className="mt-1 text-sm text-gray-800 line-clamp-3">
                                        {latestNotificationText}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {latestNotificationTime}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Recent Workspaces
                                    </p>
                                    {recentWorkspaces.length ? (
                                        <ul className="mt-2 space-y-1 text-sm text-gray-800">
                                            {recentWorkspaces.slice(0, 4).map((workspaceItem) => (
                                                <li key={workspaceItem.id || workspaceItem.name}>
                                                    {workspaceItem.name}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-600">
                                            No workspace data yet.
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                        Productivity Snapshot
                                    </p>
                                    <p className="mt-1 text-sm text-gray-700">
                                        Theme: {isDarkTheme ? "Dark" : "Light"}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-700">
                                        AI Summary: {aiSummary ? "Ready" : "Not generated"}
                                    </p>
                                    <button
                                        className="mt-3 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                                        onClick={() => setAiOverviewOpen(true)}
                                    >
                                        Open AI Overview
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
                        <button
                            ref={quickAiButtonRef}
                            className={`relative flex items-center justify-center h-11 w-11 rounded-xl border shadow-sm transition-all ${
                                isQuickAiOpen
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() => setIsQuickAiOpen((prev) => !prev)}
                            aria-label="Quick AskAI"
                            title="Quick AskAI"
                        >
                            <PiChatCircle size={21} />
                        </button>
                        <button
                            className="relative flex items-center justify-center h-11 w-11 rounded-xl bg-white text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
                            onClick={handleThemeToggle}
                            aria-label="Toggle theme"
                            title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkTheme ? (
                                <AiOutlineSun size={20} />
                            ) : (
                                <AiOutlineMoon size={20} />
                            )}
                        </button>
                        <button
                            className="relative flex items-center justify-center h-11 w-11 rounded-xl bg-white text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
                            onClick={() => navigate("/app/notifications")}
                            aria-label="Notifications"
                            title="Notifications"
                        >
                            <PiBellRingingDuotone size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {isQuickAiOpen && (
                        <div
                            ref={quickAiRef}
                            className="fixed top-[68px] right-4 z-50 w-[min(92vw,360px)] h-[min(70vh,520px)]"
                        >
                            <Chatbot
                                variant="quick"
                                onClose={() => setIsQuickAiOpen(false)}
                            />
                        </div>
                    )}
                    <section className="flex-1 px-3 pb-4 pt-16 sm:p-6">
                        <div className="h-full max-w-[1440px] mx-auto">
                            <Outlet />
                        </div>
                    </section>

                    <footer className="w-full text-center border-t border-gray-200/80 bg-white/60 py-4 text-gray-500 text-xs sm:text-sm px-4">
                        &copy; 2025 Benote
                    </footer>
                </main>
            </div>

            {/* Notification Banner */}
            {notificationPopping && (
                <NotificationBanner
                    notification={latestNotification}
                    onDismiss={handleDismissNotification}
                    onMarkAsRead={handleMarkNotificationAsRead}
                    onOpenNotifications={handleOpenNotifications}
                />
            )}
        </div>
    );
}

export default DashboardLayout;
