import { useState } from 'react';
import { useNavigate } from 'react-router';
import { logIn } from '../../services/authService';

export default function LogInPage({ setUser }) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const user = await logIn(formData);
            setUser(user);
            navigate('/search');
        } catch (err) {
            setErrorMsg(err.message || 'Log in failed');
        }
    }

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg('');
    }

    return (
        <section className="center-page container">
            <div className="card page-card auth-card">
                <h2 className="page-title">Log In</h2>
                <form className="form-grid" onSubmit={handleSubmit}>
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    <div className="form-actions">
                        <button className="primary" type="submit">Log In</button>
                    </div>
                    {errorMsg && <p className="muted text-error">{errorMsg}</p>}
                </form>
            </div>
        </section>
    );
}