import * as functions from 'firebase-functions';

export const firestore = functions.auth.user().onCreate(async () => {
  // y u no print
  console.log("hey little mama let me whisper in your ear");
});