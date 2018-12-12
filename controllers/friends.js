const HttpStatus = require('http-status-codes');

const User = require('../models/userModels');

module.exports = {
    FollowUser(req, res) {
        console.log(req.body);

        const followUser = async () => {

            // Update following array with clicked user
            await User.update({
                _id: req.user._id,
                // Check we're not already following this user
                // $ne - not equal
                "following.userFollowed": { $ne: req.body.userFollowed }
            }, {
                    $push: {
                        following: {
                            userFollowed: req.body.userFollowed
                        }
                    }
                });

            // update followers on clicked user
            await User.update({
                _id: req.body.userFollowed,
                // Check we're not already following this user
                // $ne - not equal
                "followers.follower": { $ne: req.user._id }
            }, {
                    $push: {
                        followers: {
                            follower: req.user._id
                        }
                    }
                });
        };

        followUser()
            .then(() => {
                res.status(HttpStatus.OK).json({ message: 'Following user now' });
            })
            .catch(err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
            });
    }
}