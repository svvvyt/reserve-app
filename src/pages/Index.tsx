import MainLayout from '@/layout/MainLayout';
import Welcome from '@/components/Welcome';
import Services from '@/components/Services';
import Booking from '@/components/Booking';
import Address from '@/components/Address';

const Index = () => {
  return (
    <MainLayout>
      <Welcome />
      <Services />
      <Booking />
      <Address />
    </MainLayout>
  );
};

export default Index;
