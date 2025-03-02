const admin = require("firebase-admin");


async function sendNotificationPush(fcmtoken,title,description) {
    try {
        const message = {
            token: fcmtoken, // replace with the user's device token
            notification: {
                title: title,
                body: description,
            },
            android: {
                notification: {
                    sound: "default",
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                    },
                },
            },
        };

        await admin.messaging().send(message);
    } catch (error) {
        console.log("Error",error);
        
    }
}

 async function sendNotificationSound(fcmtoken,title,description,sound) {
    try {
        const message = {
            token: fcmtoken, // replace with the user's device token
            notification: {
                title: title,
                body: description,
            },
            android: {
                notification: {
                    sound: sound,
                    channel_id: sound+'_channel',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: sound+'.wav',
                    },
                },
            },
        };

        await admin.messaging().send(message);
    } catch (error) {
        console.log("Eee",error);
        
    }
}


exports.sendNotificationSound = sendNotificationSound;
exports.sendNotificationPush = sendNotificationPush;