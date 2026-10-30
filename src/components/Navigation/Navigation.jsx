import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Navigation.css";

function Navigation({ isLoggedIn, onLoginClick, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isProfilePage = pathname === "/profile" || pathname === "/saved-notes";
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleEscape = (evt) => {
      if (evt.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const getLinkClass = ({ isActive }) =>
    `navigation__link${isActive ? " navigation__link_active" : ""}`;

  return (
    <nav className="navigation">
      <button
        className={`navigation__toggle${isMenuOpen ? " navigation__toggle_open" : ""}`}
        type="button"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span className="navigation__toggle-bar" />
      </button>
      <ul
        className={`navigation__list${isMenuOpen ? " navigation__list_open" : ""}`}
        onClick={() => setIsMenuOpen(false)}
      >
        {isLoggedIn ? (
          <>
            <li>
              <NavLink to="/profile" className={getLinkClass}>
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink to="/saved-notes" className={getLinkClass}>
                Saved Notes
              </NavLink>
            </li>
            <li>
              <button
                className={`navigation__link${isProfilePage ? " navigation__link_type_muted" : ""}`}
                type="button"
                onClick={onLogout}
              >
                Log Out
              </button>
            </li>
          </>
        ) : (
          <li>
            <button className="navigation__signin" type="button" onClick={onLoginClick}>
              Sign in
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
