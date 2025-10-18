import { useState, useEffect, use } from "react"
import {
  WalletMinimal,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import ProfileDropdown from "./ProfileDropdown"
import { NAVIGATION_MENU } from "../../utils/data"

const NavigationItem = ({ item, isActive, onClick, isCollapsed }) => {
  const Icon = item.icon;

  return <button
    onClick={() => onClick(item.id)}
    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
      ? "bg-green-50 text-green-900 shadow-sm shadow-green-50"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
  >
    <Icon
      className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-green-600" : "text-gray-500"
        }`}
    />
    {!isCollapsed && <span className="ml-3">{item.label}</span>}
  </button>

};
const DashboardLayout = ({ children, activeMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard");
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = (window.innerWidth < 768);
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (isProfileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isProfileDropdownOpen]);

  const handleNavigation = (itemId) => {
    setActiveNavItem(itemId);
    navigate(`/${itemId}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sidebarCollapsed = !isMobile && false;
  return (

    <div className="flex h-screen bg-gray-50">
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${isMobile
        ? sidebarOpen
          ? "translate-x-0"
          : "-translate-x-full"
        : "translate-x-0"
        } ${sidebarCollapsed ? "w-16" : "w-64"
        } bg-white border-r border-gray-200`}
      >
        <div className="flex items-center h-16 border-b border-gray-200 px-6">
          <Link className="flex items-center space-x-3" to="/dashboard">
            <div className="h-8 w-8 bg-gradient-to-br from-green-900 to-green-700 rounded-lg flex items-center justify-center">
              <WalletMinimal className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && <span className="text-gray-900 font-bold text-xl">FinRisk</span>}
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {NAVIGATION_MENU.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={activeNavItem === item.id}
              onClick={() => handleNavigation(item.id)}
              isCollapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-900 transition-all duration-300"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-gray-500" />
            {!sidebarCollapsed && <span className="">Logout</span>}
          </button>
        </div>
      </div>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"
          }`}
      >
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>
            )}
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Here’s an overview of your portfolio
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ProfileDropdown
              isOpen={isProfileDropdownOpen}
              onToggle={(e) => {
                e.stopPropagation();
                setProfileDropdownOpen(!isProfileDropdownOpen);
              }}
              avatar={user?.avatar || ""}
              username={user?.username || ""}
              email={user?.email || ""}
              onLogout={logout}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;