export default async function handler(req, res) {
    console.log(req.method);
    // if (req.method !== 'POST') {
    //   return res.status(405).json({ message: 'Method Not Allowed' });
    // }
  
    const messageType = req.headers['x-amz-sns-message-type'];
  
    if (!messageType) {
      return res.status(400).json({ message: 'Bad Request: Missing SNS message type' });
    }
  
    const snsMessage = req.body;
    console.log(snsMessage);

    io.emit('new-notification', {
      id: snsMessage.MessageId,
      message: snsMessage.Message,
      timestamp: new Date().toISOString()
    });
  
    if (messageType === 'SubscriptionConfirmation') {
      const { SubscribeURL } = snsMessage;
      try {
        await fetch(SubscribeURL);
        console.log('SNS subscription confirmed.');
        return res.status(200).json({ message: 'Subscription confirmed' });
      } catch (error) {
        console.error('Error confirming subscription:', error);
        return res.status(500).json({ message: 'Error confirming subscription', error });
      }
    } else if (messageType === 'Notification') {
      const { Message, MessageId } = snsMessage;
      console.log(`Received SNS notification (ID: ${MessageId}): ${Message}`);
      return res.status(200).json({ message: 'Notification received' });
    } else if (messageType === 'UnsubscribeConfirmation') {
      console.log('Received unsubscribe confirmation:', snsMessage);
      return res.status(200).json({ message: 'Unsubscribe confirmation received' });
    } else {
      console.warn('Unknown SNS message type:', messageType);
      return res.status(400).json({ message: 'Unknown SNS message type' });
    }
  }
  
