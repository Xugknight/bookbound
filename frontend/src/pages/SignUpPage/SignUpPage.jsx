import { useState } from 'react';
import { useNavigate } from 'react-router';
import { signUp } from '../../services/authService';

export default function SignUpPage({ setUser }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const disable = formData.password !== formData.confirm;

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const user = await signUp({ name: formData.name, email: formData.email, password: formData.password });
            setUser(user);
            navigate('/search');
        } catch (err) {
            setErrorMsg(err.message || 'Sign Up Failed');
        }
    }

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg('');
    }

    return (
        <section className="card stack">
            <h2>Sign Up</h2>
            <form className="stack" onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <input type="password" name="confirm" placeholder="Confirm Password" value={formData.confirm} onChange={handleChange} required />
                <button className="primary" type="submit" disabled={disable}>Create account</button>
                {errorMsg && <p className="muted" style={{ color: '#f87171' }}>{errorMsg}</p>}
            </form>
        </section>
    );
}