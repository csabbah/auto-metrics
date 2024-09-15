import React, { FC, useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";

const Header = () => {
  return;
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.25,
      }
    );
  }, []);
  return (
    <nav ref={headerRef}>
      <Link className="nav-btn" href="/">
        Auto-metrics
      </Link>
      <div className="yo" style={{ display: "flex", gap: 10 }}>
        <Link href="/" className="nav-btn">
          GALLERY
        </Link>
        <Link className="nav-btn" href="/about">
          ABOUT
        </Link>
        <Link href="/" className="nav-btn" id="book-btn">
          GET IN TOUCH
        </Link>
      </div>
    </nav>
  );
};
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default Layout;
