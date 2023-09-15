// const got = require("got");
// module.exports = {
//     name: "7tvpaint",
//     cooldown: 5000,
//     aliases: ['7tvcolor'],
//     description: `usage: ${bot.Config.prefix} - `,
//     execute: async context => {
//         try {
//             // command code
//             let ivr
//             let userID
//             if(context.message.args[0]){
//                 ivr = await got(`https://api.ivr.fi/v2/twitch/user?login=${context.message.args[0]}`).json();
//                 userID = ivr[0].id
//             } else {
//                 userID = context.user.id
//             }

//             let data
//             try{
//                 data = await got(`https://7tv.io/v3/users/twitch/${userID}`).json()
//             } catch(err) {
//                 return {
//                     text: `Error, could not get the 7tv information for this user. FeelsDankMan`,
//                     reply: true,
//                 };
//             }

//             const StvID = data.user.id
            
//             if(!data.user.style){
//                 return {
//                     text: `This user does not have a 7tv paint applied.`,
//                     reply: true,
//                 };
//             }

//             let paintIDBody = {
//                 operationName: 'GetUser',
//                 variables: {
//                     id: StvID,
//                 },
//                 query: `
//                 query GetUser($id: ObjectID!) {
//                   user(id: $id) {
//                     id
//                     username
//                     display_name
//                     created_at
//                     avatar_url
//                     style {
//                       color
//                       paint_id
//                     }
//                     connections {
//                       id
//                       username
//                       display_name
//                       platform
//                       linked_at
//                       emote_capacity
//                       emote_set_id
//                     }
//                   }
//                 }
//               `,
//             };

//             (async () => {
//                 const XD = await got
//                     .post('https://7tv.io/v3/gql', {
//                         headers: {
//                             'content-type': 'application/json',
//                         },
//                         body: JSON.stringify(paintIDBody),
//                     })
//                     .json();
            
//                 console.log(XD);
//             })();

//             const paintID = data.user.style.color

//             let body = {
//                 operationName: 'GetCosmestics',
//                 variables: {
//                     list: [paintIDBody],
//                 },
//                 query: `query GetCosmestics($list: [ObjectID!]) {
//                   cosmetics(list: $list) {
//                     paints {
//                       id
//                       kind
//                       name
//                       function
//                       color
//                       angle
//                       shape
//                       image_url
//                       repeat
//                       stops {
//                         at
//                         color
//                         __typename
//                       }
//                       shadows {
//                         x_offset
//                         y_offset
//                         radius
//                         color
//                         __typename
//                       }
//                       __typename
//                     }
//                     badges {
//                       id
//                       kind
//                       name
//                       tooltip
//                       tag
//                       __typename
//                     }
//                     __typename
//                   }
//                 }`,
//             };
            
//             (async () => {
//                 const XD = await got
//                     .post('https://7tv.io/v3/gql', {
//                         headers: {
//                             'content-type': 'application/json',
//                         },
//                         body: JSON.stringify(body),
//                     })
//                     .json();
            
//                 console.log(XD);
//             })();

//             return {
//                 text: `${body}`,
//                 reply: true,
//             };
//         } catch (err) {
//             console.log(err);
//             return {
//                 text: `error monkaS ${err.message} `,
//             };
//         }
//     },
// };