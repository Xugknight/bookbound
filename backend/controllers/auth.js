const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
    signUp,
    logIn
};

async function signUp(req, res) {
    try {
        const user = await User.create(req.body);
        const token = createJWT(user);
        res.json(token);
    } catch (err) {
        res.status(400).json({ message: 'Sign Up Failed' });
    }
}

async function logIn(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) throw new Error('Bad Credentials');
        const ok = await bcrypt.compare(req.body.password, user.password);
        if (!ok) throw new Error('Bad Credentials');
        const token = createJWT(user);
        res.json(token);
    } catch {
        res.status(400).json({ message: 'Bad Credentials' });
    }
}

function createJWT(user) {
    return jwt.sign({ user }, process.env.SECRET, { expiresIn: '24h' });
}