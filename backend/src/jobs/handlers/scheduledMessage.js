import Message from '../../modules/messages/message.model.js';
import Conversation from '../../modules/conversations/conversation.model.js';
import logger from '../../config/logger.js';

export async function handleScheduledMessages() {
  try {
    const now = new Date();
    
    // Find messages scheduled to be sent now or in the past
    const scheduledMessages = await Message.find({
      status: 'pending',
      scheduledAt: { $lte: now },
    })
    .populate('senderId', 'name avatarUrl')
    .populate('conversationId')
    .populate('attachments')
    .limit(100); // Process in batches

    if (scheduledMessages.length === 0) {
      return;
    }

   console.log(`Processing ${scheduledMessages.length} scheduled messages`);

    for (const message of scheduledMessages) {
      try {
        // Update message status
        message.status = 'sent';
        message.scheduledAt = null;
        await message.save();

        // Update conversation last message time
        if (message.conversationId) {
          await Conversation.findByIdAndUpdate(message.conversationId._id, {
            lastMessageAt: new Date(),
          });
        }

        // TODO: Emit via Socket.IO if available
        // This would require access to the io instance
        // For now, the message will appear when users refresh or reconnect

        logger.debug(`Scheduled message ${message._id} sent successfully`);
      } catch (error) {
        logger.error(`Failed to send scheduled message ${message._id}:`, error);
        
        // Mark as failed after 3 attempts
        if (!message.attempts) {
          message.attempts = 0;
        }
        
        message.attempts += 1;
        
        if (message.attempts >= 3) {
          message.status = 'failed';
          logger.error(`Scheduled message ${message._id} marked as failed after 3 attempts`);
        }
        
        await message.save();
      }
    }

   console.log(`Completed processing scheduled messages`);
  } catch (error) {
    logger.error('Error in scheduled message handler:', error);
  }
};