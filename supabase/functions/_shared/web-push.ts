import webpush from "npm:web-push@3.6.7";

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushMessage {
  title: string;
  body: string;
  url: string;
  tag?: string;
  icon?: string;
}

export async function sendPushNotification(
  subscription: PushSubscription,
  message: PushMessage,
  vapidPublicKey: string,
  vapidPrivateKey: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Configurar los detalles de VAPID con la URL como recomienda Apple APNs
    // Apple APNs es estricto y a veces el 'mailto:' puede causar inconvenientes de parsing de origen
    const subject = "mailto:noreply@localconecta.com";

    webpush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey);

    // iOS-compatible payload: FLAT structure
    const cleanPayload: Record<string, string> = {
      title: message.title,
      body: message.body,
      url: message.url,
    };

    if (message.tag) cleanPayload.tag = message.tag;
    if (message.icon) cleanPayload.icon = message.icon;

    const payloadString = JSON.stringify(cleanPayload);

    // 🔍 DEBUG
    console.log("[Web Push NPM] Sending payload:", payloadString);
    console.log(
      "[Web Push NPM] To endpoint:",
      subscription.endpoint.substring(0, 50) + "...",
    );

    // sendNotification maneja toda la criptografía AES-128-GCM de manera perfecta
    const sendResult = await webpush.sendNotification(
      subscription as any,
      payloadString,
      {
        urgency: "high",
        TTL: 86400,
        headers: {
          Urgency: "high", // Refuerzo para Apple APNs (iOS Safari)
        },
      },
    );

    console.log(
      "[Web Push NPM] APNs/FCM Response code:",
      sendResult.statusCode,
    );

    return { success: true };
  } catch (error: any) {
    console.error(
      "[Web Push NPM] Error:",
      error.body || error.message || String(error),
    );
    return { success: false, error: error.message || String(error) };
  }
}
