import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/images/logo.svg";
import SearchForm from "../SearchForm/SearchForm";
import Navigation from "../Navigation/Navigation";

function Header({ isLoggedIn, onSearch, onLoginClick, onLogout }) {
  return (
    <header className="header">
      <Link to="/" className="header__brand" aria-label="IdeaBinder home">
        <img className="header__logo" src={logo} alt="" />
        <span className="header__name">IdeaBinder</span>
      </Link>
      <SearchForm onSearch={onSearch} />
      <Navigation
        isLoggedIn={isLoggedIn}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
      />
    </header>
  );
}

export default Header;
