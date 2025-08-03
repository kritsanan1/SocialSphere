import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { type User } from "@shared/schema";
import {
  Share2,
  LayoutDashboard,
  Edit,
  Calendar,
  BarChart3,
  Image,
  History,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Create Content", href: "/create", icon: Edit },
  { name: "Scheduled Posts", href: "/scheduled", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Media Library", href: "/media", icon: Image },
  { name: "Post History", href: "/history", icon: History },
  { name: "User Management", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth() as { user: User | null };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[hsl(200,98%,54%)] to-[hsl(329,77%,53%)] rounded-lg flex items-center justify-center">
            <Share2 className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SocialSync</h1>
            <p className="text-xs text-gray-500">Content Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-[hsl(200,98%,54%)] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50"}
            alt="User profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName || user?.email || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "Viewer"}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="w-full justify-start text-gray-600 hover:text-gray-900"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
