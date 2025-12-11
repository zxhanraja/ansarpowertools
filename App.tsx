
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { Loader } from './components/Loader';

// Lazy Load Pages for Performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Cart = lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess').then(module => ({ default: module.OrderSuccess })));
const Tracking = lazy(() => import('./pages/Tracking').then(module => ({ default: module.Tracking })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Policy = lazy(() => import('./pages/Policy').then(module => ({ default: module.Policy })));
const Terms = lazy(() => import('./pages/Terms').then(module => ({ default: module.Terms })));
const Privacy = lazy(() => import('./pages/Privacy').then(module => ({ default: module.Privacy })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <OrderProvider>
                <Layout>
                  <Suspense fallback={
                    <div className="flex h-[80vh] items-center justify-center">
                      <Loader text="Loading..." />
                    </div>
                  }>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/success/:orderId" element={<OrderSuccess />} />
                      <Route path="/tracking" element={<Tracking />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/policy" element={<Policy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </OrderProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
