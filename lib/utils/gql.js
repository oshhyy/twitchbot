const got = require("got");
const config = require("../../config.json");

const gql = got.extend({
    url: 'https://gql.twitch.tv/gql',
    throwHttpErrors: false,
    responseType: 'json',
    headers: {
        authorization: config.gqlAuth,
        'client-id': config.gqlClientID,
        'client-integrity': config.clientIntegrity,
        'client-session-id': config.clientSessionID,
        "X-Device-Id": config.XDeviceID,
    }
});

async function makeRequest(query) {
    const gqlReq = await gql
        .post({
            json: query
        })
        .json();

    return gqlReq;
}

// changeBadges = async (badgeSetID, badgeSetVersion, channelID, q) => {
//     try {
//         const query = [];
//         const operation = {
//             operationName: 'ChatSettings_SelectChannelBadge',
//             query:
//                 'mutation ChatSettings_SelectChannelBadge($input: SelectChannelBadgeInput!) {\n  selectChannelBadge(input: $input) {\n    isSuccessful\n    user {\n      id\n      self {\n        selectedBadge {\n          ...badge\n          __typename\n        }\n        availableBadges {\n          ...badge\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment badge on Badge {\n  id\n  setID\n  version\n  title\n  image1x: imageURL(size: NORMAL)\n  image2x: imageURL(size: DOUBLE)\n  image4x: imageURL(size: QUADRUPLE)\n  clickAction\n  clickURL\n  __typename\n}',
//             variables: {
//                 input: {
//                     badgeSetID,
//                     badgeSetVersion,
//                     channelID
//                 }
//             }
//         };
//         query.push(operation);
//         if (q) {
//             return operation;
//         }
//         const data = await makeRequest(query);
//         return data;
//     } catch (error) {
//         console.error('Network error:', error);
//     }
// };

// disableBadges = async (channelID, q) => {
//     try {
//         const query = [];
//         const operation = {
//             operationName: 'ChatSettings_DeselectChannelBadge',
//             query:
//                 'mutation ChatSettings_DeselectChannelBadge($input: DeselectChannelBadgeInput!) {\n  deselectChannelBadge(input: $input) {\n    user {\n      id\n      self {\n        selectedBadge {\n          ...badge\n          __typename\n        }\n        availableBadges {\n          ...badge\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment badge on Badge {\n  id\n  setID\n  version\n  title\n  image1x: imageURL(size: NORMAL)\n  image2x: imageURL(size: DOUBLE)\n  image4x: imageURL(size: QUADRUPLE)\n  clickAction\n  clickURL\n  __typename\n}',
//             variables: {
//                 channelID
//             }
//         };
//         query.push(operation);
//         if (q) {
//             return operation;
//         }
//         const data = await makeRequest(query);
//         return data;
//     } catch (error) {
//         console.error('Network error:', error);
//     }
// };

// getBadges = async (channelLogin, q) => {
//     try {
//         const query = [];
//         const operation = {
//             operationName: 'ChatSettings_Badges',
//             query:
//                 'query ChatSettings_Badges($channelLogin: String!) {\n  currentUser {\n    id\n    hasPrime\n    hasTurbo\n    selectedBadge {\n      ...badge\n      __typename\n    }\n    availableBadges {\n      ...badge\n      __typename\n    }\n    subscriptionSettings {\n      isBadgeModifierHidden\n      __typename\n    }\n    __typename\n  }\n  user(login: $channelLogin) {\n    id\n    self {\n      selectedBadge {\n        ...badge\n        __typename\n      }\n      availableBadges {\n        ...badge\n        __typename\n      }\n      subscriptionBenefit {\n        ...subBenefit\n        __typename\n      }\n      subscriptionTenure(tenureMethod: STREAK) {\n        months\n        __typename\n      }\n      __typename\n    }\n    subscriptionProducts {\n      id\n      displayName\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment badge on Badge {\n  id\n  setID\n  version\n  title\n  image1x: imageURL(size: NORMAL)\n  image2x: imageURL(size: DOUBLE)\n  image4x: imageURL(size: QUADRUPLE)\n  clickAction\n  clickURL\n  __typename\n}\n\nfragment subBenefit on SubscriptionBenefit {\n  id\n  endsAt\n  platform\n  gift {\n    gifter {\n      id\n      login\n      displayName\n      __typename\n    }\n    isGift\n    __typename\n  }\n  interval {\n    unit\n    duration\n    __typename\n  }\n  isDNRd\n  isExtended\n  pendingSubscription {\n    ...pendingSubscription\n    __typename\n  }\n  purchasedWithPrime\n  renewsAt\n  tier\n  __typename\n}\n\nfragment pendingSubscription on PendingSubscription {\n  price\n  startsAt\n  tier\n  type\n  __typename\n}\n',
//             variables: {
//                 channelLogin
//             }
//         };
//         query.push(operation);
//         if (q) {
//             return operation;
//         }
//         const data = await makeRequest(query);
//         return data;
//     } catch (error) {
//         console.error('Network error:', error);
//     }
// };

// exports.badgeCycler = async (channel) => {
//     const data = await getBadges(channel);
//     if (!data || !data[0] || !data[0].data || !data[0].data.user) {
//         return;
//     }
//     let currentBadge = [];

//     //get badge
//     if (!data[0].data.user.self.selectedBadge) {
//         currentBadge = data[0].data.currentUser.selectedBadge;
//     } else {
//         currentBadge = data[0].data.user.self.selectedBadge;
//     }

//     //define array of available badges
//     let availableBadges = data[0].data.user.self.availableBadges;
//     const channelID = data[0].data.user.id;
//     // try to catch error issue
//     if (!availableBadges || !availableBadges.length) {
//         availableBadges = data[0].data.currentUser.selectedBadge;
//     }
//     //find the badge in available badge array that === curent badge
//     let currentIndex

//     if (currentBadge === null || !currentBadge) {
//         currentIndex = availableBadges[0];
//         currentIndex = 0 
//     } else {
//         currentIndex = availableBadges.findIndex(
//             (badge) => badge.id === currentBadge.id
//         );
//     }
//     //choose next badge be increasing the index of array by 1, and looping through array
//     currentIndex = (currentIndex + 1) % availableBadges.length;
//     const newBadge = availableBadges[currentIndex];
//     await changeBadges(newBadge.setID, newBadge.version, channelID);
//     global.gqlBadgeCooldown = false;
//     setTimeout(() => { global.gqlBadgeCooldown = true; }, 1000);
// };

// exports.deselectBadges = async (channelID) => {
//     await disableBadges(channelID)
// }