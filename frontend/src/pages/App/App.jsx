import { Routes, Route, Link } from 'react-router';
import HomePage from '../HomePage/HomePage';
import SearchPage from '../SearchPage/SearchPage';
import ReadingListPage from '../ReadingListPage/ReadingListPage';

export default function App() {
    return (
        <div className="container">
            <nav className="card" style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                <Link to="/">Home</Link>
                <Link to="/search">Search</Link>
                <Link to="/list">My List</Link>
            </nav>
            <main style={{ marginTop: '1rem' }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/list" element={<ReadingListPage />} />
                </Routes>
            </main>
        </div>
    );
}