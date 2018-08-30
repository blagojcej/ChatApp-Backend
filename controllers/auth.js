const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');

const User = require('../models/userModels');
const Helpers = require('../Helpers/helpers');

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
                message: error.details
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
                    return res.status(HttpStatus.CREATED).json({
                            message: 'User created successfully',
                            user
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