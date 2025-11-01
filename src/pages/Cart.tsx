import { CartView } from '@/components/marketplace/CartView';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { AIAdvisorFAB } from '@/components/layout/AIAdvisorFAB';

const Cart = () => {
  return (
    <>
      <CartView />
      <AIAdvisorFAB />
      <BottomNavigation />
    </>
  );
};

export default Cart;
