import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiMenu } from "react-icons/hi";
import Sidebar from "./Sidebar";
import Header from "./Header";
import NotificationBanner from "./NotificationBanner";
import { SearchModal } from "../../../features/search";
import { AiOverviewModal } from "../../../features/ai";
import { sendBrowserNotification } from "../../../utils/sendBrowserNotification";

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
    const [aiSummary, setAiSummary] = useState("");
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 640);

    const location = useLocation();
    const navigate = useNavigate();

    const workspaceTitle =
        useSelector((state) => state.workspace.workspace.name) || "Workspace";
    const teamTitle = useSelector((state) => state.team.team.name) || "Team";
    const workspaceEmoji =
        useSelector((state) => state.workspace.workspace.emoji) || "";

    const loc = location.pathname.split("/").slice(2);

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

    // Fetch latest notification
    useEffect(() => {
        const fetchLatestNotification = async () => {
            try {
                const response = await fetch(`${apiURL}/api/notifications?latest=1`, {
                    headers: header,
                });

                if (response.status === 204) {
                    setLatestNotification(null);
                    return;
                }

                const data = await response.json();
                setLatestNotification(data);
            } catch (error) {
                console.error("Error fetching latest notification:", error);
            }
        };

        fetchLatestNotification();
    }, [unreadCount]);

    // Auto-dismiss notification after 10 seconds
    useEffect(() => {
        if (latestNotification) {
            setNotificationPopping(true);
            const timer = setTimeout(() => {
                setNotificationPopping(false);
                setLatestNotification(null);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [latestNotification]);

    // Send browser notification
    useEffect(() => {
        if (latestNotification) {
            sendBrowserNotification(
                latestNotification.message,
                latestNotification.type
            );
        }
    }, [latestNotification]);

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

    const handleDismissNotification = () => {
        setNotificationPopping(false);
        setLatestNotification(null);
    };

    return (
        <div className="bg-white text-black h-screen min-h-screen w-full flex flex-col overflow-hidden">
            <div className="w-full flex-1 flex flex-col sm:flex-row overflow-hidden">
                {/* Hamburger for mobile */}
                {!showSidebar && !isMobileNavOpen && (
                    <button
                        className="fixed top-4 left-4 z-50 p-2 rounded-sm bg-gray-600 text-white shadow-sm sm:hidden"
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
                        loc={loc}
                        unreadCount={unreadCount}
                        handleCollapseBar={handleCollapseBar}
                        toggleMobileNav={toggleMobileNav}
                        setIsMobileNavOpen={setIsMobileNavOpen}
                        setSearchOpened={setSearchOpened}
                        setAiOverviewOpen={setAiOverviewOpen}
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
                <main className="w-full flex flex-col h-screen min-h-0 overflow-y-auto scrollbar-hide bg-white/80">
                    <Header
                        showSidebar={showSidebar}
                        loc={loc}
                        workspaceTitle={workspaceTitle}
                        workspaceEmoji={workspaceEmoji}
                        teamTitle={teamTitle}
                        toggleMobileNav={toggleMobileNav}
                        setSearchOpened={setSearchOpened}
                        setAiOverviewOpen={setAiOverviewOpen}
                    />

                    <section className="flex-1 p-4 sm:p-6">
                        <div className="h-full">
                            <Outlet />
                        </div>
                    </section>

                    <footer className="w-full text-center mt-5 border-t pt-4 text-gray-500 text-xs sm:text-sm px-4">
                        &copy; 2025 Benote
                    </footer>
                </main>
            </div>

            {/* Notification Banner */}
            {notificationPopping && (
                <NotificationBanner
                    notification={latestNotification}
                    onDismiss={handleDismissNotification}
                />
            )}
        </div>
    );
}

export default DashboardLayout;
