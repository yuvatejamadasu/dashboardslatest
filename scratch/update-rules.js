import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const privateKey = process.env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
});

const db = admin.database();

const rules = {
  "rules": {
    ".read": "true",
    ".write": "true",
    "users": {
      ".indexOn": ["hubId", "storeId", "role"]
    },
    "hubs": {
      ".indexOn": ["status"]
    },
    "stores": {
      ".indexOn": ["hubId", "status"]
    },
    "products": {
      ".indexOn": ["hubId"]
    }
  }
};

async function updateRules() {
  try {
    console.log('Updating database rules...');
    await db.setRules(JSON.stringify(rules));
    console.log('Successfully updated database rules!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating rules:', error);
    process.exit(1);
  }
}

updateRules();
