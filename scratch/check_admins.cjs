const fs = require('fs');
const admin = require('firebase-admin');

const env = fs.readFileSync('.env', 'utf8');
const pkMatch = env.match(/VITE_FIREBASE_PRIVATE_KEY="(.+?)"/s);

if (!pkMatch) {
  console.error('Could not find VITE_FIREBASE_PRIVATE_KEY in .env');
  process.exit(1);
}

const pk = pkMatch[1].replace(/\\n/g, '\n');

const serviceAccount = {
  project_id: 'prime-basket-demo-kenya-db',
  private_key: pk,
  client_email: 'firebase-adminsdk-fbsvc@prime-basket-demo-kenya-db.iam.gserviceaccount.com'
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://prime-basket-demo-kenya-db-default-rtdb.firebaseio.com'
});

const db = admin.database();

db.ref('users').once('value')
  .then(s => {
    const users = s.val();
    if (!users) {
      console.log('No users found in database.');
      process.exit(0);
    }
    const admins = Object.entries(users).filter(([k, v]) => v.role === 'super_admin' || v.role === 'super-admin');
    console.log(JSON.stringify(admins, null, 2));
    process.exit(0);
  })
  .catch(e => {
    console.error('Error fetching users:', e);
    process.exit(1);
  });
