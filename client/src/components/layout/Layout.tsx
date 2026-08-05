import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content-area">
        <div className="fade-in-container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default Layout;
