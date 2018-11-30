const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const dbConfig = require('../config/secrets');

module.exports = {
    VerifyToken: (req, res, next) => {
        if(!req.headers.authorization) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                message: 'No Authorization'
            })
        }

        //search in the cookies value auder 'auth' key, we're setting this value under 'auth' key in controllers/auth.js
        const token = req.cookies.auth || req.headers.authorization.split(' ')[1];        
        // console.log(req.headers);
        console.log(token);

        if (!token) {
            return res.status(HttpStatus.FORBIDDEN).json({ message: 'No token provided' });
        }

        return jwt.verify(token, dbConfig.secret, (err, decoded) => {
            if (err) {
                console.log(err);
                const dateNow=Date.now();
                if (err.expiredAt < dateNow) {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Token has expired. Please login again.', token: null });
                }
                next();
            }

            // We're getting user from data field in token, we're setting this value under 'auth' key in controllers/auth.js
            req.user=decoded.data;

            next();
        });
    }
}