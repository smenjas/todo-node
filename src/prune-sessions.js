import Session from './session.js';

const sessions = Session.all;
console.log(sessions);
Session.prune(sessions);
console.log(sessions);
Session.all = sessions;
