const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;


const express = require('express');
// const app = express()

const blacklist = new Set();

// app.post('/logout', (req, res) => {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (token) {
//         blacklist.add(token);
//         res.status(200).json({ message: 'User logged out succesfully' });      
//     } else{
//         res.status(400).json({ message: 'No token provided' });
//     }
// });

const logoutController = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        blacklist.add(token);
        res.status(200).json({ message: 'User logged out succesfully' });      
    } else{
        res.status(400).json({ message: 'No token provided' });
    }
}

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(token && blacklist.has(token)){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try{
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded
        next()
    } catch {
        res.status(401).json({message: 'Invalid token!'});
    }
}

module.exports = { 
    authMiddleware,
    logoutController
}