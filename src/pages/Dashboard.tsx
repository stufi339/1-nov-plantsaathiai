import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { blackBoxService } from "@/lib/blackBoxService";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Log dashboard view
    blackBoxService.logUserInteraction('page_view', 'dashboard', undefined, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-20">
      <DashboardView />
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
