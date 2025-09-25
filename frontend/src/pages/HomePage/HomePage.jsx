import { Link } from 'react-router';
import { getToken } from '../../services/authService';

export default function HomePage() {
  const authed = !!getToken();
  return (
    <section className="center-page container">
      <div className="card page-card">
        <h1 className="page-title">Bookbound</h1>
        <p className="muted">
          Build and track your reading list. Search Open Library, save titles, add notes, and rate when you are done.
        </p>
        <div className="toolbar__group toolbar__group--center">
          {!authed && (
            <>
              <Link to="/login"><button type="button">Log In</button></Link>
              <Link to="/signup"><button type="button">Sign Up</button></Link>
            </>
          )}
          <Link to="/search"><button className="primary" type="button">Browse Books</button></Link>
        </div>
      </div>
    </section>
  );
}