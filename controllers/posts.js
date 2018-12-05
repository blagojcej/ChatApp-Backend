const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const Post = require('../models/postModels');
const User = require('../models/userModels');

module.exports = {
    AddPost(req, res) {
        // console.log(req.body);
        // console.log(req.cookies);
        // console.log(req.user);

        const schema = Joi.object().keys({
            post: Joi.string().required()
        });

        const { error } = Joi.validate(req.body, schema);

        //If is an error return bad request
        if (error && error.details) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                msg: error.details
            });
        }

        const body = {
            user: req.user._id,
            username: req.user.username,
            post: req.body.post,
            created: new Date()
        }

        Post.create(body)
            .then(async (post) => {
                //add post to user
                await User.update({
                    _id: req.user._id
                }, {
                        $push: {
                            posts: {
                                postId: post._id,
                                post: req.body.post,
                                created: new Date()
                            }
                        }
                    });

                res.status(HttpStatus.OK).json({ message: 'Post created', post });
            })
            .catch(err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
            });
    },

    async GetAllPosts(req, res) {
        try {
            const posts = await Post.find({})
                .populate('user')
                .sort({ created: -1 });

            return res.status(HttpStatus.OK).json({ message: 'All posts', posts });
        } catch (err) {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
        }
    },

    async AddLike(req, res) {
        const postId = req.body._id;
        await Post.update({
            // Find post by id and check if user already liked
            _id: postId,
            //  $ne : not equal
            'likes.username': { $ne: req.user.username }
        }, {
            // $push: update record
                $push: {
                    likes: {
                        // Set the username who is added like
                        username: req.user.username
                    }
                },
                // $inc: increment value
                $inc: {
                    // Increment likes
                    totalLikes: 1
                }
            })
            .then(() => {
                res.status(HttpStatus.OK).json({ message: 'You liked the post' });
            })
            .catch(err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
            });
    }
}