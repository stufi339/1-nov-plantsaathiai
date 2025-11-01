import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, Globe, Bell, HelpCircle, Info, LogOut, ChevronRight, Shield, ShoppingCart, Sparkles, Instagram, Youtube, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/lib/marketplace/types";
import { socialLinks, appInfo } from "@/config/socialLinks";

const menuItems = [
  {
    section: "Personal",
    items: [
      { icon: User, label: "Edit Profile", description: "Name, phone, region" },
      { icon: Globe, label: "Language", description: "English, हिन्दी, ਪੰਜਾਬੀ" },
    ],
  },
  {
    section: "App Settings",
    items: [
      { icon: Sparkles, label: "AI Assistant", description: "Configure Gemini API" },
      { icon: Bell, label: "Notifications", description: "Alerts & reminders" },
      { icon: Settings, label: "Preferences", description: "Theme, units" },
    ],
  },
  {
    section: "Support",
    items: [
      { icon: HelpCircle, label: "Help & FAQs", description: "Get assistance" },
      { icon: Info, label: "About", description: "Version & credits" },
    ],
  },
];

export const ProfileView = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>('user');

  useEffect(() => {
    // Load user role from localStorage
    const savedRole = localStorage.getItem('user_role') as UserRole;
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const toggleRole = () => {
    const newRole: UserRole = userRole === 'user' ? 'admin' : 'user';
    setUserRole(newRole);
    localStorage.setItem('user_role', newRole);
    toast.success(`Switched to ${newRole === 'admin' ? 'Admin' : 'User'} mode`);
    
    if (newRole === 'admin') {
      navigate('/admin');
    }
  };

  const goToCart = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-elevated">
            F
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Farmer Name</h1>
            <p className="text-sm text-muted-foreground">+91 98765 43210</p>
            <p className="text-sm text-muted-foreground">Punjab, India</p>
          </div>
        </div>
      </header>

      {/* Role Switcher */}
      <div className="px-6 mb-6">
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Current Mode</p>
                <p className="text-sm text-gray-600">
                  {userRole === 'admin' ? 'Admin Panel' : 'User Mode'}
                </p>
              </div>
            </div>
            <Button
              onClick={toggleRole}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Switch to {userRole === 'admin' ? 'User' : 'Admin'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <Card className="bg-card shadow-soft overflow-hidden">
          <button
            onClick={goToCart}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-foreground">Shopping Cart</p>
              <p className="text-xs text-muted-foreground">View your bulk orders</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </button>
        </Card>
      </div>

      {/* Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center bg-card shadow-soft">
            <p className="text-2xl font-bold text-foreground mb-1">3</p>
            <p className="text-xs text-muted-foreground">Fields</p>
          </Card>
          <Card className="p-3 text-center bg-card shadow-soft">
            <p className="text-2xl font-bold text-foreground mb-1">12</p>
            <p className="text-xs text-muted-foreground">Scans</p>
          </Card>
          <Card className="p-3 text-center bg-card shadow-soft">
            <p className="text-2xl font-bold text-foreground mb-1">45</p>
            <p className="text-xs text-muted-foreground">Days</p>
          </Card>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-6 space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              {section.section}
            </h2>
            <Card className="bg-card shadow-soft overflow-hidden">
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.label === "AI Assistant") {
                      navigate('/settings/ai');
                    } else {
                      toast.info(`${item.label} - Coming soon!`);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors ${
                    idx !== section.items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </Card>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-6 mt-6">
        <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/5">
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>

      {/* Social Media & Contact */}
      <div className="px-6 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Connect With Us
        </h2>
        <Card className="bg-card shadow-soft p-4">
          <div className="grid grid-cols-2 gap-3 social-grid">
            {/* Instagram */}
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
            >
              <Instagram className="w-7 h-7" />
              <span className="text-sm font-medium">Instagram</span>
            </a>

            {/* YouTube */}
            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-red-600 text-white hover:shadow-lg transition-all"
            >
              <Youtube className="w-7 h-7" />
              <span className="text-sm font-medium">YouTube</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${socialLinks.email}`}
              className="social-link flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-blue-600 text-white hover:shadow-lg transition-all"
            >
              <Mail className="w-7 h-7" />
              <span className="text-sm font-medium">Email Us</span>
            </a>

            {/* Phone */}
            <a
              href={`tel:${socialLinks.phone}`}
              className="social-link flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-green-600 text-white hover:shadow-lg transition-all"
            >
              <Phone className="w-7 h-7" />
              <span className="text-sm font-medium">Call Us</span>
            </a>
          </div>
        </Card>
      </div>

      {/* App Version */}
      <div className="px-6 mt-6 mb-6 text-center">
        <p className="text-xs text-muted-foreground">{appInfo.name} v{appInfo.version}</p>
        <p className="text-xs text-muted-foreground">{appInfo.tagline}</p>
      </div>
    </div>
  );
};
