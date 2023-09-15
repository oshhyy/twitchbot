const got = require("got");
const config = require("../../config.json");

async function sendWebhook(URL, message) {
  try {
    await got.post(URL + '?wait=true', {
      headers: {
        'Content-Type': 'application/json'
      },
      json: message
    });
  } catch (e) {
    console.log(e)
  }
}

function returnEmbed(Author, color, Title, Desc, Thumbnail, Image, Fields = []) {
  return {
    embeds: [
      {
        author: {
          name: Author.name,
          url: Author.url
        },
        color: color,
        title: Title,
        description: Desc,
        timestamp: new Date(),
        thumbnail: {
          url: Thumbnail
        },
        image: {
          url: Image
        },
        footer: {
          text: 'Occurred',
          icon_url:
            'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_41839ab2a0484c60b76c9f29e9780c19/default/dark/3.0'
        },
        fields: Fields
      }
    ]
  };
}

exports.error = async (prefix, message) => {
  const hookURL = config.webhookCommands;
  const hookMessage = returnEmbed(
    {
      name: '',
      url: ''
    },
    '16744576',
    `${prefix}`,
    `${message}`
  );
  await sendWebhook(hookURL, hookMessage);
  console.log("sent")
};

exports.success = async (prefix, message) => {
  const hookURL = config.webhookCommands;
  const hookMessage = returnEmbed(
    {
      name: '',
      url: ''
    },
    '4388216',
    `${prefix}`,
    `${message}`
  );
  await sendWebhook(hookURL, hookMessage);
  console.log("sent")
};

exports.suggest = async (prefix, message) => {
  const hookURL = config.webhookReports;
  const hookMessage = returnEmbed(
    {
      name: '',
      url: ''
    },
    '16770893',
    `New suggestion from ${prefix}!`,
    `${message}`
  );
  await sendWebhook(hookURL, hookMessage);
  console.log("sent")
};

exports.report = async (prefix, message) => {
  const hookURL = config.webhookReports;
  const hookMessage = returnEmbed(
    {
      name: '',
      url: ''
    },
    '16744576',
    `New bug report from ${prefix}!`,
    `${message}`
  );
  await sendWebhook(hookURL, hookMessage);
  console.log("sent")
};

exports.colorEmbed = async (color, prefix, message) => {
  const hookURL = config.webhookLogs;
  const hookMessage = returnEmbed(
    {
      name: '',
      url: ''
    },
    `${color}`,
    `${prefix}`,
    `${message}`
  );
  await sendWebhook(hookURL, hookMessage);
  console.log("sent")
};