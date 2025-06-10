import { Message, IMessage, calculateExpirationDate } from '../models/Message';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { CryptoService } from '../../shared/crypto';

export class MessageService {
  async sendMessage(
    senderId: string,
    recipientId: string,
    content: string
  ): Promise<IMessage> {
    // Validate users exist and get recipient's public key
    const [sender, recipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId)
    ]);

    if (!sender || !recipient) {
      throw new Error('Invalid sender or recipient');
    }

    // Import recipient's public key
    const recipientPublicKey = await CryptoService.importPublicKey(recipient.publicKey);

    // Encrypt the message
    const {
      encryptedContent,
      encryptedKey,
      iv
    } = await CryptoService.encryptMessage(content, recipientPublicKey);

    // Create and save the message with expiration
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      encryptedContent,
      encryptedKey,
      iv,
      expiresAt: calculateExpirationDate(recipient.messageRetentionPeriod)
    });

    await message.save();
    return message;
  }

  async getConversation(
    userId: string,
    otherUserId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    messages: IMessage[];
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    // Get user's private key for decryption
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const privateKey = await CryptoService.importPrivateKey(user.privateKey);

    const [messages, total] = await Promise.all([
      Message.find({
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
      
      Message.countDocuments({
        $or: [
          { sender: userId, recipient: otherUserId },
          { sender: otherUserId, recipient: userId }
        ]
      })
    ]);

    // Decrypt messages where user is the recipient
    const decryptedMessages = await Promise.all(
      messages.map(async (message) => {
        const isRecipient = message.recipient._id.toString() === userId;
        if (isRecipient) {
          try {
            const decryptedContent = await CryptoService.decryptMessage(
              message.encryptedContent,
              message.encryptedKey,
              message.iv,
              privateKey
            );
            return {
              ...message.toObject(),
              content: decryptedContent
            };
          } catch (error) {
            console.error('Failed to decrypt message:', error);
            return {
              ...message.toObject(),
              content: '[Failed to decrypt message]'
            };
          }
        }
        return message;
      })
    );

    return {
      messages: decryptedMessages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  async getRecentConversations(userId: string): Promise<any[]> {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { recipient: new mongoose.Types.ObjectId(userId) }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
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
                    { $eq: ['$recipient', new mongoose.Types.ObjectId(userId)] },
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

    // Decrypt last messages
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const privateKey = await CryptoService.importPrivateKey(user.privateKey);

    return await Promise.all(
      conversations.map(async (conv) => {
        const isRecipient = conv.lastMessage.recipient?.toString() === userId;
        if (isRecipient) {
          try {
            const decryptedContent = await CryptoService.decryptMessage(
              conv.lastMessage.encryptedContent,
              conv.lastMessage.encryptedKey,
              conv.lastMessage.iv,
              privateKey
            );
            return {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                content: decryptedContent
              }
            };
          } catch (error) {
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
      })
    );
  }

  async markAsRead(messageIds: string[], userId: string): Promise<void> {
    await Message.updateMany(
      {
        _id: { $in: messageIds },
        recipient: userId,
        read: false
      },
      {
        $set: { read: true }
      }
    );
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await Message.findOne({
      _id: messageId,
      $or: [{ sender: userId }, { recipient: userId }]
    });

    if (!message) {
      throw new Error('Message not found or unauthorized');
    }

    await Message.deleteOne({ _id: messageId });
  }

  async updateMessageRetention(userId: string, retentionPeriod: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.messageRetentionPeriod = retentionPeriod as any;
    await user.save();

    // Update expiration for existing messages
    await Message.updateMany(
      { recipient: userId },
      { $set: { expiresAt: calculateExpirationDate(user.messageRetentionPeriod) } }
    );
  }
}

export const messageService = new MessageService(); 