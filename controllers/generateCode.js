exports.generateCode = () => {
     return Math.floor(1000 + Math.random() * 9000).toString();
}


exports.generateRandomString = (length) => {
     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
     let randomString = '';

     for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          randomString += characters.charAt(randomIndex);
     }

     return randomString;
}

