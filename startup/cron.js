var cron = require('node-cron');
const moment = require('moment-timezone');

const Settings = require("../models/Settings");
const Duas = require("../models/Duas");
const { User } = require("../models/user");


const { sendNotificationSound, sendNotificationPush } = require('../utils/pushNotification');

module.exports = async function () {
  cron.schedule('*/1 * * * *', async () => {
    console.log('running a task every one minutes');
    const data = await Settings.find().sort({ _id: -1 }).populate('user');
    const utcNow = moment.utc();
    data.forEach((element, index) => {
      const userTime = utcNow.clone().tz(element.location?.iana_timezone);
      const notificationTime = userTime.clone().startOf('minute').format('HH:mm');
      let user = element?.user;
      if (user.fcmtoken == 'null' || user.fcmtoken == undefined || !user.fcmtoken || user.fcmtoken == 'any') return
      const fcmtoken = JSON.parse(user?.fcmtoken);
      let voiceName = element?.azan_voice;

      console.log("userTime", notificationTime);
      if (element?.notification_reminder?.prayer_alert == true) {
        let prayerObj = element?.namaz_timing;
        for (const property in prayerObj) {
          if (notificationTime == prayerObj[property]) {
            if (property == 'Fajr' || property == 'Dhuhr' || property == 'Asr' || property == 'Maghrib' || property == 'Isha') {
              let title = property + ' Namaz Reminder';
              let desc = `Pray ${property} prayer`;
              sendNotificationSound(fcmtoken, title, desc, voiceName)
            }
          }
        }

      }
    });

  });


  cron.schedule('0 */23 * * *', async () => {
    const duas = await Duas.find().sort({ _id: -1 })
    const random = Math.floor(Math.random() * duas.length);
    const randomDua = duas[random];
    const users = await Settings.find().sort({ _id: -1 }).populate('user');
    users.forEach((element, index) => {
      const user = element?.user
      if (element?.notification_reminder?.dua_day == false) return
      if (user.fcmtoken == 'null' || user.fcmtoken == undefined || !user.fcmtoken || user.fcmtoken == 'any') return
      const fcmtoken = JSON.parse(user.fcmtoken)
      sendNotificationPush(fcmtoken, randomDua?.title, randomDua?.arabic)
    });

  });


  cron.schedule('0 */14 * * *', async () => {
    const users = await Settings.find().sort({ _id: -1 }).populate('user');
    users.forEach((element, index) => {
      const user = element?.user
      if (element?.notification_reminder?.quran_reminder == false) return
      if (user.fcmtoken == 'null' || user.fcmtoken == undefined || !user.fcmtoken || user.fcmtoken == 'any') return
      const fcmtoken = JSON.parse(user.fcmtoken)

      const title = "Quran Pak Reminder";
      const desc = "Take a moment to connect with the words of Allah. Reflect on the guidance and wisdom within. Even one verse today can bring peace and blessings to your heart."
      sendNotificationPush(fcmtoken, title, desc)
    });

  });











}


