// Basic CRUD operation on models...

// Create
// Read
// Update
// Delete

const bcrypt = require("bcryptjs");
// const jwt = require('jsonwebtoken');

// const user = require('../models/user');

const { user } = require('../models');

// Create
const createUser = async (req, res) => {
    try{
        const salt = await bcrypt.genSalt(10);
        const userData = {
            name: req.body.name,
            email: req.body.email,
            password_hash: await bcrypt.hash(req.body.password,salt),
        }
        // const _user = await user.create(req.body);
        const _user = await user.create(userData);
        res.status(201).json(_user);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};

// Read
const readUsers = async (req, res) => {
    try{
        const users = await user.findAll();
        res.json(users);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};

const readUser = async (req, res) => {
    try{
        const _user = await user.findByPk(req.params.id);
        if (_user){
            res.json(_user);
        }
        res.status(404).json({message: 'User not found'});
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};

// Update
const updateUser = async (req, res) => {
    try {
        const _user = await user.findByPk(req.params.id);
        if (_user) {
            await _user.update(req.body);
            const updatedUser = { ..._user.get() }; // Use `.get()` to get raw data excluding Sequelize methods
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete 
const deleteUser = async (req, res) => {
    try{
        const _user = await user.findByPk(req.params.id);
        if(!_user){
            res.status(404).json({ message: 'User not found!' })
        } else{
            await _user.destroy();
            res.json({message: 'User deleted!'})
        }
    }catch(error){
        res.status(500).json({ message: error.message })
    }
};

module.exports = {
    createUser,
    readUsers,
    readUser,
    updateUser,
    deleteUser,
};