const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://todo-tasks-5ffff.firebasestorage.app",
});

const db = admin.firestore();
module.exports = { admin, db };
