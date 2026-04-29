const { db } = require('./src/config/firebase');
const { ref, get } = require('firebase/database');

async function checkUser(email) {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
        const users = snapshot.val();
        const userId = Object.keys(users).find(key => users[key].email?.toLowerCase() === email.toLowerCase());
        if (userId) {
            console.log('User Found:', users[userId]);
        } else {
            console.log('User not found');
        }
    } else {
        console.log('No users in database');
    }
}

checkUser('nagashekar.charani@gmail.com');
