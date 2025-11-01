import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { AIAdvisorFAB } from "@/components/layout/AIAdvisorFAB";
import { MarketplaceView } from "@/components/marketplace/MarketplaceView";

const Marketplace = () => {
  return (
    <>
      <MarketplaceView />
      <AIAdvisorFAB />
      <BottomNavigation />
    </>
  );
};

export default Marketplace;
