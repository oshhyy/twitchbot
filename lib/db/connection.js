const mongo = require("mongoose"); 
const config = require("../../config.json");
// go here https://www.mongodb.com/cloud/atlas/register
// make a free cloud atlas database 

// the bot.Config.connection should be your host url + database name
// example url: 

// you will need to go to mongodb.com and go to Network Access, and give your IP adress access so you can connect

// i forgot some of the steps kek

mongo.connect(config.connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongo.set('strictQuery', false); // this just ignores a stupid error log

mongo.connection.on('connected', () => {
    console.log("connected")
  });

mongo.connection.on('disconnected', () => {
    console.log("disconnected")
});

// example schema 
const ChannelSchema = new mongo.Schema({
    id: { type: String, unique: true },
    username: String,
    isChannel: Boolean,
    joinedAt: Date,
    prefix: String,
    disabledCommands: [],
    editors: [],
    settings: {
        offlineOnly: Boolean,
    }
});

exports.channels = mongo.model('channels',ChannelSchema);

const UserSchema = new mongo.Schema({
    id: { type: String, unique: true },
    username: String,
    level: Number,
    lastfm: String,
    mcid: String
});

exports.users = mongo.model('users',UserSchema);

// now you've created and exported the channels table
// you can mimic the same structure for other things like users

// thats just the schema, now u need to make the actual entry for each channel:

// const newChannel = new mongo.channels({
//     id: `user's id`,
//     username: 'forsen',
//     isChannel: true,
//     joinedAt: Date.now()
// })
// await newChannel.save();




// // now that you have the schema, and a entry made, you can access or edit the entry


// // examples of accessing the db:

// // finds all channels (array)
// const allChannels = await mongo.channels.find({});

// // finds channels where isChannel is true (array)
// const activeChannels = await mongo.channels.find({isChannel: true})

// // finds a channel by username
// const forsensChannel = await mongo.channels.findOne({username: 'forsen'})


// // update an entry, this would find forsen's entry, and update it 
// await mongo.channels.updateOne(
//     { username: 'forsen'},
//     { $set: { isChannel: false } }
// )

// // say you changed usernames, just do:
// await mongo.channels.updateOne(
//     { id: 'userid' },
//     { $set: { username: 'new username' } }
// )

// // resource for other commands: https://www.mongodb.com/docs/drivers/node/current/quick-reference/



// // if you add it to the global bot object, just do
// const test = await bot.db.channels.find({username: 'test'})
