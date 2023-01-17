const mongoose = require('mongoose')
global.Promise = mongoose.Promise;
const config = require('../config/config')
const db_name = `${global.gConfig.database}`;
const host = `${global.gConfig.host}`;
const DB_URL = `mongodb+srv://subhra:subhCareer%40123@cluster0.hak0j9r.mongodb.net/?retryWrites=true&w=majority`


mongoose.connection.openUri(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
/******************************** Events of mongoose connection. ******************************************************/
// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
     console.log('success', 'Mongoose default connection open to ' + DB_URL)
});
// if the connection throw an error
mongoose.connection.on('error', (err) => {
     console.log('error', 'Mongoose default connection error')
});
// when the connectio is disconnected
mongoose.connection.on('disconnected', () => {
     console.log('disconnected', 'Mongoose detault connection is disconnected')
})
//if the node process ends,close the mongoose connection
process.on('SIGINT', () => {
     mongoose.connection.close(() => {
          console.log('warning', 'Mongoose default connection disconnected through app termination')
     });
});
