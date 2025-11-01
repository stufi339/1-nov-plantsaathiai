import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { NotificationsView } from "@/components/notifications/NotificationsView";
import { blackBoxService } from "@/lib/blackBoxService";

const Notifications = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Log notifications page view
    blackBoxService.logUserInteraction('page_view', 'notifications', undefined, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
      </div>

      <NotificationsView />
      <BottomNavigation />
    </div>
  );
};

export default Notifications;
