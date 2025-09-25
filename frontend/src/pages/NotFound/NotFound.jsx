import { Link } from 'react-router';

export default function NotFound() {
    return (
        <section className="center-page container">
            <div className="card page-card">
                <h2 className="no-top-margin">Page not found</h2>
                <p className="muted">We could not find what you were looking for.</p>
                <div className="toolbar__group toolbar__group--center">
                    <Link to="/"><button type="button">Home</button></Link>
                    <Link to="/search"><button className="primary" type="button">Browse Books</button></Link>
                </div>
            </div>
        </section>
    );
}