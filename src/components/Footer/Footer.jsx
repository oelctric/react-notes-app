import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <p className="footer__copyright">
        © {new Date().getFullYear()} IdeaBinder. Powered by{" "}
        <a className="footer__link" href="https://dummyjson.com" target="_blank" rel="noreferrer">
          DummyJSON
        </a>
      </p>
      <ul className="footer__links">
        <li>
          <Link className="footer__link" to="/">
            Home
          </Link>
        </li>
        <li>
          <a
            className="footer__link"
            href="https://github.com/oelctric/react-notes-app"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;
