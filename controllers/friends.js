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
                        },
                        // Add notification to users who are followed
                        notifications: {
                            senderId: req.user._id,
                            message: `${req.user.username} is now following you.`
                            // We don't set other properties because they have default values
                        }
                    }
                });
        };

        followUser()
            .then(() => {
                res.status(HttpStatus.OK).json({ message: 'Following user now' });
            })
            .catch(err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' + err });
            });
    },
    UnFollowUser(req, res) {
        console.log(req.body);

        const unfollowUser = async () => {

            // Update following array with clicked user
            await User.update({
                _id: req.user._id,
            }, {
                    // $pull - Remove from array
                    $pull: {
                        following: {
                            userFollowed: req.body.userFollowed
                        }
                    }
                });

            // update followers on clicked user
            await User.update({
                _id: req.body.userFollowed,

            }, {
                    // $pull - Remove from array
                    $pull: {
                        followers: {
                            follower: req.user._id
                        }
                    }
                });
        };

        unfollowUser()
            .then(() => {
                res.status(HttpStatus.OK).json({ message: 'Unfollowing user now' });
            })
            .catch(err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' + err });
            });
    },
    async MarkNotification(req, res) {
        console.log(req.body);

        // If request-body doesn't contains deleteVal (notification is not deleted), then mark as read
        if (!req.body.deleteVal) {
            await User.updateOne({
                // Get user
                _id: req.user._id,
                // Get notification for user
                // We pass req.params.id because in the route we declare variable :id
                // we're sending id through parameter and body (look at users.service.ts in angular)
                'notifications._id': req.params.id
            }, {
                    // $set - to set value in object array
                    $set: {
                        // we're using $ to update field we want to update
                        'notifications.$.read': true
                    }
                })
                .then(() => {
                    res.status(HttpStatus.OK).json({ message: 'Marked as read' })
                })
                .catch(err => {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' + err });
                });
        } else {
            await User.update({
                // Get user
                _id: req.user._id,
                // Get notification for user
                // We pass req.params.id because in the route we declare variable :id
                // we're sending id through parameter and body (look at users.service.ts in angular)
                'notifications._id': req.params.id
            }, {
                    // $pull - to remove item from array
                    $pull: {
                        notifications: { _id: req.params.id }
                    }
                })
                .then(() => {
                    res.status(HttpStatus.OK).json({ message: 'Deleted successfully' })
                })
                .catch(err => {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' + err });
                });
        }
    },
    async MarkAllNotification(req, res) {
        await User.update({
            _id: req.user._id,
        }, {
                $set: {
                    // $[elem] set property to group of data
                    'notifications.$[elem].read': true
                }
            },
            {
                // Loop through array, look for element that has property 'read' to false, and with $set we're setting the value to true
                arrayFilters: [{ 'elem.read': false }],
                // Update mutiple documents
                multi: true
            })
            .then(() => {
                res.status(HttpStatus.OK).json({ message: 'Marked all successfully' })
            })
            .catch(err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' + err });
            });
    }
}