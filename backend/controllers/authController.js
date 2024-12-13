const { user } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY=process.env.JWT_SECRET_KEY

const loginUser = async (req, res) => {

    const _user = await user.findOne({where: {email: req.body.email}})
    if (!_user) {
        res.status(404).json({message: 'User not found'});
    } else {
        const password_valid = await bcrypt.compare(req.body.password, _user.password_hash);
        if (password_valid){
            const token = jwt.sign({
                id: _user.id,
                email: _user.email
            }, SECRET_KEY, 
            {expiresIn: '1m'})
            res.json({token})
            // res.status(200).json({message: 'User authenticated'});
        } else{
            res.status(401).json({message: 'Wrong password'});
        }
    }
};

const logoutUset = async(req, res) => {
    
}

module.exports = {
    loginUser
};