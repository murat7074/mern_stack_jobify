import { Outlet } from 'react-router-dom';
import Wrapper from '../../assets/wrappers/SharedLayout';
import { BigSidebar, SmallSidebar, Navbar } from '../../components';


const SharedLayout = () => {
  return (
    <Wrapper>
      <main className="dashboard">
        {/* SmallSidebar veya BigSidebar seçimi css style ile ilgili örnek:  @media (min-width: 992px) {
    display: none; } */}

        <SmallSidebar />
        <BigSidebar />
        <div>
          <Navbar />
          <div className="dashboard-page">
            <Outlet />
          </div>
        </div>
      </main>
    </Wrapper>
  );
};

export default SharedLayout;
