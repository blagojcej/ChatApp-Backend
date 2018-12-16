const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    posts: [{
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        },
        post: {
            type: String
        },
        created: {
            type: Date,
            default: Date.now()
        }
    }],
    following: [
        { userFollowed: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }
    ],
    followers: [
        { follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }
    ],
    notifications: [
        {
            // Id of user whi is viewed ypur profile, or has followed you
            senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            // Message displayed to the user
            message: { type: String },
            // If notification is about viewing your profile
            viewProfile: { type: Boolean, default: false },
            // Date when notification is created
            created: { type: Date, default: Date.now() },
            // If the notification is read
            read: { type: Boolean, default: false },
            // This field is to be sure the notification is set once, no matter how many times someone is viewed your profile
            date: { type: String, default: '' }
        }
    ]
});

module.exports = mongoose.model('User', userSchema);