import {
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import Header from "./../components/Header";
import Footer from "./../components/Footer";
import Home from "./../pages/Home";
import News from "./../pages/News";
import CropsInfo from "./../pages/CrossInfo";
import TipsGuides from "./../pages/TipsGuides";
import MarketPrices from "./../pages/MarketPrices";
import ContactPage from "./../pages/ContactPage";
import Login from "./../pages/Login";
import Signup from "./../pages/Signup";
import PrivateRoute from "./../components/PrivateRoute";
import DashboardLayout from "../pages/Dashboard/src/DashboardLayout";
import DashboardHome from "../pages/Dashboard/src/DashboardHome";
import Analytics from "../pages/Dashboard/src/tables/Analytics";
import Reports from "../pages/Dashboard/src/tables/Reports";
import Farmer from "../pages/Dashboard/src/pages/farmers";
import Farms from "../pages/Dashboard/src/pages/farms";
import Crops from "../pages/Dashboard/src/pages/crops";
import Equipment from "../pages/Dashboard/src/pages/equipment";
import Sales from "../pages/Dashboard/src/pages/sales";
import Fertilization from "../pages/Dashboard/src/pages/fertilization";
import { AccountSettings } from "../pages/Dashboard/src/pages/accountSettings"; // Waxaan u malaynayaa in tani tahay `AccountSettings.jsx`
// import NotFound from "../pages/notfound";

import { Toaster } from "react-hot-toast";

function AppWrapper() {
  const location = useLocation();
  // Qaar ka mid ah routes-ka (login, signup, dashboard) ma laha header iyo footer
  const hideHeaderFooter = ['/login', '/signup', '/dashboard'].some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {/* Toaster for notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header-ka wuu qarsan yahay haddii loo baahdo */}
      {!hideHeaderFooter && <Header />}

      {/* Main Routes of the application */}
      <Routes>
        {/* Public Routes (Login, Signup) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private Dashboard Routes - Require Authentication */}
        {/* Kani waa route-ka guud ee dashboard-ka oo leh PrivateRoute */}
        <Route path="/dashboard" element={<PrivateRoute />}>
          {/* DashboardLayout wuxuu bixiyaa qaab dhismeedka dashboard-ka (sidebar, header, content) */}
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} /> {/* Default dashboard page */}
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="farmers" element={<Farmer />} />
            <Route path="farms" element={<Farms />} />
            <Route path="crops" element={<Crops />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="sales" element={<Sales />} />
            <Route path="fertilization" element={<Fertilization />} />
            <Route path="settings" element={<AccountSettings />} /> {/* Account Settings Route */}
          </Route>
        </Route>

        {/* Main Website Routes (Public, with Header/Footer) */}
        {/* Waxaan dhigay routes-kan meel ka duwan dashboard-ka si ay u isticmaalaan Header & Footer */}
        <Route
          path="/"
          element={
            <>
              {/* Waxaad halkan ku celcelin kartaa qaybaha boggaaga */}
              <div id="home">
                <Home />
              </div>
              <div id="news">
                <News />
              </div>
              <div id="crops">
                <CropsInfo />
              </div>
              <div id="guides">
                <TipsGuides />
              </div>
              <div id="market">
                <MarketPrices />
              </div>
              <div id="contact">
                <ContactPage />
              </div>
            </>
          }
        />
        
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>

      {/* Footer-ka wuu qarsan yahay haddii loo baahdo */}
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default AppWrapper;