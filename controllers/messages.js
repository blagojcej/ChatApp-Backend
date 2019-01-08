const httpStatusCode = require('http-status-codes');

const Message = require('../models/messageModels');
const Conversation = require('../models/conversationModels');
const User = require('../models/userModels');

module.exports = {

    async GetAllMessages(req, res) {
        const { sender_Id, receiver_Id } = req.params;
        const conversation = await Conversation.findOne({
            $or: [
                {
                    $and: [
                        {
                            'participants.senderId': sender_Id
                        },
                        {
                            'participants.receiverId': receiver_Id
                        }
                    ]
                },
                {
                    $and: [
                        {
                            'participants.senderId': receiver_Id
                        },
                        {
                            'participants.receiverId': sender_Id
                        }
                    ]
                }
            ]
        // select method allow to get particular field from result (object)
        }).select('_id');

        if (conversation) {
            const messages=await Message.findOne({conversationId: conversation._id});

            res.status(httpStatusCode.OK).json({message: 'Messages returned', messages});
        }
    },

    SendMessage(req, res) {
        const { sender_Id, receiver_Id } = req.params;

        // Check if both users has started conversation prevoiusly
        Conversation.find({
            // $or operator is taking
            $or: [
                { participants: { $elemMatch: { senderId: sender_Id, receiverId: receiver_Id } } },
                { participants: { $elemMatch: { senderId: receiver_Id, receiverId: sender_Id } } }
            ]
        }, async (err, result) => {
            //Get the conversation id from the array
            // Then use to find document for both users
            if (result.length > 0) {

                // console.log(result);

                await Message.update({
                    // Get id of conversation from parametars
                    conversationId: result[0]._id
                }, {
                        // Update message array
                        $push: {
                            message: {
                                senderId: req.user._id,
                                receiverId: req.params.receiver_Id,
                                sendername: req.user.username,
                                receivername: req.body.receiverName,
                                body: req.body.message,
                            }
                        }
                    })
                    .then(() => {
                        res.status(httpStatusCode.OK).json({ message: 'Message added' });
                    }, err => {
                        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
                    });

            } else {
                // Add conversation for the first time
                const newConversation = new Conversation();
                newConversation.participants.push({
                    // Get from messageRoutes.js
                    // senderId: req.params.sender_Id,
                    senderId: req.user._id,
                    // Get from messageRoutes.js
                    receiverId: req.params.receiver_Id
                });

                // Save new conversation
                const saveConversation = await newConversation.save();

                // console.log(saveConversation);

                // Create new message
                const newMessage = new Message();
                newMessage.conversationId = saveConversation._id;
                newMessage.sender = req.user.username;
                newMessage.receiver = req.body.receiverName;
                newMessage.message.push({
                    senderId: req.user._id,
                    receiverId: req.params.receiver_Id,
                    sendername: req.user.username,
                    receivername: req.body.receiverName,
                    body: req.body.message,
                });

                // Fill char array in user  (sender)
                await User.update({
                    _id: req.user._id
                }, {
                        $push: {
                            chatList: {
                                // We're using $each operator because we want to use another operator $position
                                // $each operator takes an array of values
                                $each: [
                                    {
                                        receiverId: req.params.receiver_Id,
                                        msgId: newMessage._id
                                    }
                                ],
                                $position: 0
                            }
                        }
                    });

                // Fill char array in user model (receiver)
                await User.update({
                    _id: req.params.receiver_Id
                }, {
                        $push: {
                            chatList: {
                                // We're using $each operator because we want to use another operator $position
                                // $each operator takes an array of values
                                $each: [
                                    {
                                        receiverId: req.user._id,
                                        msgId: newMessage._id
                                    }
                                ],
                                $position: 0
                            }
                        }
                    });

                await newMessage.save()
                    .then(() => {
                        res.status(httpStatusCode.OK).json({ message: 'Message sent successfully' });
                    }, err => {
                        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
                    });
            }
        });
    }
}