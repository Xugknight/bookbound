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
        <section className="card stack">
            <h2>Log In</h2>
            <form className="stack" onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <button className="primary" type="submit">Log In</button>
                {errorMsg && <p className="muted" style={{ color: '#f87171' }}>{errorMsg}</p>}
            </form>
        </section>
    );
}