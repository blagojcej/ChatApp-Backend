const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

//Load User Model
const User = require('../models/userModels');
// require('../models/userModels');
// const User = mongoose.model('User');
const Helpers = require('../Helpers/helpers');
const dbConfig = require('../config/secrets');

module.exports = {
    async CreateUser(req, res) {
        const schema = Joi.object().keys({
            username: Joi.string().min(5).max(10).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(5).required()
        });

        //If there is an error get the error, else get the value
        const {
            error,
            value
        } = Joi.validate(req.body, schema);
        console.log(value);
        //If is an error return bad request
        if (error && error.details) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                msg: error.details
            });
        }

        //Check email in database          
        const userEmail = await User.findOne({
            email: Helpers.lowerCase(req.body.email)
        });
        //If email exists
        if (userEmail) {
            return res.status(HttpStatus.CONFLICT).json({
                message: 'Email already exists'
            });
        }


        //Check username in database        
        const userName = await User.findOne({
            username: Helpers.firstUpper(req.body.username)
        });
        //If username exists
        if (userName) {
            return res.status(HttpStatus.CONFLICT).json({
                message: 'Username already exists'
            });
        }


        return bcrypt.hash(value.password, 10, (err, hash) => {
            if (err) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Error hashing password'
                });
            }

            const body = {
                username: Helpers.firstUpper(value.username),
                email: Helpers.lowerCase(value.email),
                password: hash
            };

            User.create(body)
                .then((user) => {
                    const token = jwt.sign({
                        data: user
                    }, dbConfig.secret, {
                            expiresIn: '1h'
                        });
                    res.cookie('auth', token);
                    res.status(HttpStatus.CREATED).json({
                        message: 'User created successfully',
                        user,
                        token
                    })
                        .catch((err) => {
                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                                message: 'Error occured'
                            });
                        });
                });
        });
    },

    async LoginUser(req, res) {
        // console.log(req.body);
        if (!req.body.username || !req.body.password) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'No mepty fields allowed'
            });
        }

        // Find user by username
        await User.findOne({ username: Helpers.firstUpper(req.body.username) })
            .then(user => {
                // console.log(user);

                // If user is not found
                if (!user) {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        message: 'Username not found'
                    });
                }

                // compare entered password with one stored in database
                return bcrypt.compare(req.body.password, user.password)
                    .then((result) => {
                        // console.log(result);

                        // If password doesn't match
                        if (!result) {
                            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                                message: 'Password is incorrect'
                            });
                        }

                        // If password match
                        const token = jwt.sign({ data: user }, dbConfig.secret, {
                            expiresIn: '120'
                        });

                        res.cookie('auth', token);
                        return res.status(HttpStatus.OK).json({
                            message: 'Login successful',
                            user,
                            token
                        });
                    })
            })
            .catch(err => {
                // console.log(err);

                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error occured'
                });
            })
    }
}