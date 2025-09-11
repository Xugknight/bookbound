const BASE_URL = '/api/auth';

export async function signUp(userData) {
    const token = await request(`${BASE_URL}/signup`, 'POST', userData);
    localStorage.setItem('token', token);
    return getUser();
}

export async function logIn(credentials) {
    const token = await request(`${BASE_URL}/login`, 'POST', credentials);
    localStorage.setItem('token', token);
    return getUser();
}

export function logOut() { localStorage.removeItem('token'); }

export function getUser() {
    const token = getToken();
    return token ? JSON.parse(atob(token.split('.')[1])).user : null;
}

export function getToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const { exp } = JSON.parse(atob(token.split('.')[1]));
        if (exp * 1000 < Date.now()) { localStorage.removeItem('token'); return null; }
        return token;
    } catch {
        localStorage.removeItem('token');
        return null;
    }
}

async function request(url, method = 'GET', payload) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (payload) options.body = JSON.stringify(payload);
    const res = await fetch(url, options);
    if (!res.ok) {
        try { const e = await res.json(); throw new Error(e.message || 'Request Failed'); }
        catch { throw new Error('Request Failed'); }
    }
    return res.json();
}