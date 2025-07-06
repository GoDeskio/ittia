"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = exports.MessageService = void 0;
const Message_1 = require("../models/Message");
const User_1 = require("../models/User");
class MessageService {
    async sendMessage(senderId, recipientId, content) {
        const [sender, recipient] = await Promise.all([
            User_1.User.findById(parseInt(senderId)),
            User_1.User.findById(parseInt(recipientId))
        ]);
        if (!sender || !recipient) {
            throw new Error('Invalid sender or recipient');
        }
        const message = {
            sender: senderId,
            recipient: recipientId,
            content: content,
        };
        return message;
    }
    async getConversation(userId, otherUserId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const user = await User_1.User.findById(parseInt(userId));
        if (!user) {
            throw new Error('User not found');
        }
        const [messages, total] = await Promise.all([
            Message_1.Message.find({
                $or: [
                    { sender: userId, recipient: otherUserId },
                    { sender: otherUserId, recipient: userId }
                ]
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('sender', 'name profilePicture')
                .populate('recipient', 'name profilePicture'),
            Message_1.Message.countDocuments({
                $or: [
                    { sender: userId, recipient: otherUserId },
                    { sender: otherUserId, recipient: userId }
                ]
            })
        ]);
        const decryptedMessages = await Promise.all(messages.map(async (message) => {
            const isRecipient = message.recipient._id.toString() === userId;
            if (isRecipient) {
                try {
                    return {
                        ...message.toObject(),
                        content: message.content || '[Encrypted message]'
                    };
                }
                catch (error) {
                    console.error('Failed to decrypt message:', error);
                    return {
                        ...message.toObject(),
                        content: '[Failed to decrypt message]'
                    };
                }
            }
            return message;
        }));
        return {
            messages: decryptedMessages.reverse(),
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    }
    async getRecentConversations(userId) {
        const conversations = await Message_1.Message.aggregate([
            {
                $match: {}
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            '$recipient',
                            '$sender'
                        ]
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$read', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'otherUser'
                }
            },
            {
                $unwind: '$otherUser'
            },
            {
                $project: {
                    otherUser: {
                        _id: 1,
                        name: 1,
                        profilePicture: 1
                    },
                    lastMessage: {
                        encryptedContent: 1,
                        encryptedKey: 1,
                        iv: 1,
                        createdAt: 1,
                        read: 1
                    },
                    unreadCount: 1
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);
        const user = await User_1.User.findById(parseInt(userId));
        if (!user) {
            throw new Error('User not found');
        }
        return await Promise.all(conversations.map(async (conv) => {
            var _a;
            const isRecipient = ((_a = conv.lastMessage.recipient) === null || _a === void 0 ? void 0 : _a.toString()) === userId;
            if (isRecipient) {
                try {
                    return {
                        ...conv,
                        lastMessage: {
                            ...conv.lastMessage,
                            content: conv.lastMessage.content || '[Encrypted message]'
                        }
                    };
                }
                catch (error) {
                    console.error('Failed to decrypt message:', error);
                    return {
                        ...conv,
                        lastMessage: {
                            ...conv.lastMessage,
                            content: '[Failed to decrypt message]'
                        }
                    };
                }
            }
            return conv;
        }));
    }
    async markAsRead(messageIds, userId) {
        await Message_1.Message.updateMany({
            _id: { $in: messageIds },
            recipient: userId,
            read: false
        }, {
            $set: { read: true }
        });
    }
    async deleteMessage(messageId, userId) {
        const message = await Message_1.Message.findOne({
            _id: messageId,
            $or: [{ sender: userId }, { recipient: userId }]
        });
        if (!message) {
            throw new Error('Message not found or unauthorized');
        }
        await Message_1.Message.deleteOne({ _id: messageId });
    }
    async updateMessageRetention(userId, _retentionPeriod) {
        const user = await User_1.User.findById(parseInt(userId));
        if (!user) {
            throw new Error('User not found');
        }
        await Message_1.Message.updateMany({ recipient: userId });
    }
}
exports.MessageService = MessageService;
exports.messageService = new MessageService();
//# sourceMappingURL=messageService.js.map