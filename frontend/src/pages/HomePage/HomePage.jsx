import { Link } from 'react-router';
import { getUser } from '../../services/authService';

export default function HomePage() {
  const user = getUser();

  return (
    <section className="stack">

      <div className="hero">
        <div className="hero__bg" role="img" aria-label="Cozy reading nook background" />
        <div className="hero__inner card">
          <img className="hero__mark" src="/images/logo-bookbound.svg" alt="" />
          <h1 className="page-title">Bookbound</h1>
          <p className="muted">A cozy way to track and enjoy your reading.</p>

          <div className="toolbar__group toolbar__group--center">
            {!user ? (
              <>
                <Link to="/signup"><button className="primary" type="button">Get Started</button></Link>
                <Link to="/search"><button type="button">Browse Books</button></Link>
              </>
            ) : (
              <>
                <Link to="/list"><button className="primary" type="button">Go to My List</button></Link>
                <Link to="/search"><button type="button">Browse Books</button></Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="section-stripe" aria-hidden="true" />

      <div className="card paper-texture--cover">
        <h2 className="page-title">Build your perfect reading list</h2>
        <p className="muted">
          Search Open Library, curate your own list, add notes and ratings, and keep your next great read at your fingertips.
        </p>
        <div className="bookmark-accent" aria-hidden="true" />
      </div>
    </section>
  );
}