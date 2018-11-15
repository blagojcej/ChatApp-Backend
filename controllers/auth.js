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
        //    await User.findOne({
        //             email: Helpers.lowerCase(req.body.email)
        //         })
        //         .then(user => {
        //             return res.status(HttpStatus.CONFLICT).json({
        //                 message: 'Email already exists'
        //             });
        //         })
        //         .catch(err => {
        //             console.log(err);
        //             return res.status(HttpStatus.CONFLICT).json({
        //                 message: 'Email already exists'
        //             });
        //         });
        
        /*
        const userEmail = await User.findOne({
            email: Helpers.lowerCase(req.body.email)
        }, (err, user) => {
            if (err) {
                console.log(err);
            }

            if (user) {
                return res.status(HttpStatus.CONFLICT).json({
                    message: 'Email already exists'
                });
            }
        });
        */
        
        
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
        // await User.findOne({
        //         username: Helpers.firstUpper(req.body.username)
        //     })
        //     .then(user => {
        //         return res.status(HttpStatus.CONFLICT).json({
        //             message: 'Username already exists'
        //         });
        //     })
        //     .catch(err => {
        //         console.log(err);
        //         return res.status(HttpStatus.CONFLICT).json({
        //             message: 'Username already exists'
        //         });
        //     });

        /*
        const userName = await User.findOne({
            username: Helpers.firstUpper(req.body.username)
        }, (err, user) => {
            if (err) {
                console.log(err);
            }

            if (user) {
                return res.status(HttpStatus.CONFLICT).json({
                    message: 'Username already exists'
                });
            }
        });
        */

        
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
                        expiresIn: 120
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
    }
}