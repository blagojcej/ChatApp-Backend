const express = require('express');

const router = express.Router();

const UserCtrl = require('../controllers/users');
const AuthHelper = require('../Helpers/AuthHelper');

router.get('/users', AuthHelper.VerifyToken, UserCtrl.GetAllUsers);
router.get('/user/:id', AuthHelper.VerifyToken, UserCtrl.GetUser);
// router.get('/user/:username', AuthHelper.VerifyToken, UserCtrl.GetUserByName);
// This route MUST be differen from /user/:id because we don't have type of parameter, so the both routes would be same
router.get('/username/:username', AuthHelper.VerifyToken, UserCtrl.GetUserByName);

module.exports = router;