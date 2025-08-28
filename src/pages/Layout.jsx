

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar,
  Settings,
  BarChart3,
  Zap,
  Crown,
  Menu,
  X,
  Puzzle, // Import Puzzle icon
  Phone // <-- Add Phone icon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    roles: ["super_admin", "client_admin", "client_user"]
  },
  {
    title: "Leads",
    url: createPageUrl("Leads"),
    icon: Users,
    roles: ["super_admin", "client_admin", "client_user"]
  },
  {
    title: "Messages",
    url: createPageUrl("Messages"),
    icon: MessageSquare,
    roles: ["super_admin", "client_admin", "client_user"],
    feature: "whatsapp_automation"
  },
  {
    title: "Appointments",
    url: createPageUrl("Appointments"),
    icon: Calendar,
    roles: ["super_admin", "client_admin", "client_user"],
    feature: "appointment_booking"
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
    roles: ["super_admin", "client_admin"],
    feature: "analytics"
  },
  {
    title: "Automations",
    url: createPageUrl("Automations"),
    icon: Zap,
    roles: ["super_admin", "client_admin"],
    feature: "whatsapp_automation"
  },
  {
    title: "SMS Settings",
    url: createPageUrl("SMSSettings"),
    icon: Phone,
    roles: ["super_admin", "client_admin"]
  },
  {
    title: "Integrations",
    url: createPageUrl("Integrations"),
    icon: Puzzle,
    roles: ["super_admin", "client_admin"]
  }
];

const superAdminItems = [
  {
    title: "Client Management",
    url: createPageUrl("ClientManagement"),
    icon: Crown,
    roles: ["super_admin"]
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userClient, setUserClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // For demo purposes, set user role based on email
      if (userData.email.includes('admin@') || userData.role === 'admin') {
        userData.role = 'super_admin';
      } else {
        userData.role = 'client_admin';
        // Mock client data for demo
        setUserClient({
          business_name: "FitZone Gym",
          business_type: "gym",
          subscription_plan: "professional",
          features_enabled: ["lead_capture", "whatsapp_automation", "appointment_booking", "analytics"],
          status: "active"
        });
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const canAccessItem = (item) => {
    if (!user) return false;
    if (!item.roles.includes(user.role)) return false;
    if (item.feature && userClient && !userClient.features_enabled?.includes(item.feature)) {
      return false;
    }
    return true;
  };

  const getSubscriptionColor = (plan) => {
    const colors = {
      starter: "bg-blue-100 text-blue-700",
      professional: "bg-purple-100 text-purple-700", 
      enterprise: "bg-amber-100 text-amber-700"
    };
    return colors[plan] || colors.starter;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <style jsx>{`
          :root {
            --primary-navy: #1e293b;
            --primary-gold: #f59e0b;
            --accent-purple: #7c3aed;
            --success-green: #10b981;
            --warning-amber: #f59e0b;
            --danger-red: #ef4444;
          }
        `}</style>

        <Sidebar className="border-r border-slate-200 bg-white/95 backdrop-blur-md">
          <SidebarHeader className="border-b border-slate-200 p-6 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">LeadMaster Pro</h2>
                <p className="text-xs text-slate-300">SaaS Lead Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.filter(canAccessItem).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-lg ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user?.role === 'super_admin' && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                  Super Admin
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {superAdminItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-lg ${
                            location.pathname === item.url 
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                              : 'text-slate-600'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {userClient && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                  Account Info
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-4 space-y-3 bg-slate-50 rounded-lg">
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">{userClient.business_name}</p>
                      <p className="text-slate-500 capitalize">{userClient.business_type}</p>
                    </div>
                    <Badge className={`text-xs ${getSubscriptionColor(userClient.subscription_plan)}`}>
                      {userClient.subscription_plan} Plan
                    </Badge>
                    <div className="text-xs text-slate-500">
                      <p>Features: {userClient.features_enabled?.length || 0}</p>
                      <p className="capitalize">Status: {userClient.status}</p>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <Badge variant="outline" className="text-xs mt-1 capitalize">
                  {user?.role?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">LeadMaster Pro</h1>
              <div className="w-8" />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

