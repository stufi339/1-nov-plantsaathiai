import { Home, Sprout, Camera, ShoppingBag, CloudSun, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const navItems = [
  { path: "/dashboard", icon: Home, labelKey: "dashboard" },
  { path: "/soilsati", icon: Sprout, labelKey: "soilsati" },
  { path: "/disease", icon: Camera, labelKey: "disease_detection" },
  { path: "/marketplace", icon: ShoppingBag, labelKey: "marketplace" },
  { path: "/weather", icon: CloudSun, labelKey: "weather" },
  { path: "/profile", icon: User, labelKey: "profile" },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, labelKey }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1", isActive && "scale-110")} />
              <span className="text-xs font-medium">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
