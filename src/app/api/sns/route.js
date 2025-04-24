import { NextResponse } from 'next/server';
import Pusher from 'pusher';

// Initialize Pusher server
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  encrypted: true
});

export async function POST(request) {
  let message;
   try {
     message = await request.json(); // Assumes SNS body is directly parseable JSON
   } catch (e) {
     console.error('Error parsing request body:', e);
     return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
   }

  try {
    if (message.Type === 'SubscriptionConfirmation') {
      const subscribeUrl = message.SubscribeURL;

      if (!subscribeUrl) {
         return NextResponse.json({ message: 'Missing SubscribeURL' }, { status: 400 });
      }

      try {
         const confirmRes = await fetch(subscribeUrl);
         if (confirmRes.ok) {
            console.log('Subscription confirmed successfully');
            return NextResponse.json({ message: 'Subscription confirmed' });
         } else {
             console.error('Failed to confirm subscription. Status:', confirmRes.status, confirmRes.statusText);
             return NextResponse.json({ message: 'Failed to confirm subscription' }, { status: 500 });
         }
      } catch (fetchError) {
          console.error('Error fetching confirmation URL:', fetchError);
          return NextResponse.json({ message: 'Error confirming subscription' }, { status: 500 });
      }


    } else if (message.Type === 'Notification') {
      const notificationPayload = message.Message;

      let parsedPayload = notificationPayload;
      try {
        parsedPayload = JSON.parse(notificationPayload);
      } catch (parseError) {
        // Message is not JSON
      }

      // Emit the event through Pusher
      await pusher.trigger('events', 'new-event', parsedPayload);

      console.log('Received and processing notification:', parsedPayload);
      return NextResponse.json({ message: 'Notification received and processed' });


    } else if (message.Type === 'UnsubscribeConfirmation') {
       return NextResponse.json({ message: 'UnsubscribeConfirmation received' });

    } else {
      return NextResponse.json({ message: 'Unhandled message type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing SNS message:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}