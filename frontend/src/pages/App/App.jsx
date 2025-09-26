import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router';
import { getUser, logOut } from '../../services/authService';
import HomePage from '../HomePage/HomePage';
import SearchPage from '../SearchPage/SearchPage';
import ReadingListPage from '../ReadingListPage/ReadingListPage';
import LogInPage from '../LogInPage/LogInPage';
import SignUpPage from '../SignUpPage/SignUpPage';

export default function App() {
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();

  function handleLogOut() {
    logOut();
    setUser(null);
    navigate('/');
  }

  return (
    <div className="container">
      <nav className="card nav">
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/list">My List</Link>

        <span className="nav__spacer" />

        {user ? (
          <>
            <span className="muted small">Welcome, {user.name}</span>
            <button onClick={handleLogOut} type="button">Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log In</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </nav>

      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/list" element={<ReadingListPage />} />
          {!user && (
            <>
              <Route path="/login" element={<LogInPage setUser={setUser} />} />
              <Route path="/signup" element={<SignUpPage setUser={setUser} />} />
            </>
          )}
          <Route
            path="*"
            element={
              <section className="center-page">
                <div className="page-card card">
                  <h2 className="page-title">Page not found</h2>
                  <p className="muted">The page you are looking for does not exist.</p>
                  <p><Link to="/">Go back home</Link></p>
                </div>
              </section>
            }
          />
        </Routes>
      </main>
    </div>
  );
}