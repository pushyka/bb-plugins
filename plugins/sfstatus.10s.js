#!/Users/garethwilson/.nvm/versions/node/v14.0.0/bin/node
const fetch = require('node-fetch');
const env = require('../env.js');
const COLORS = {
  'OK': '#0A99D8',
  'WARN': 'red',
  'IGNORED': 'purple'
}

function formatMessage(message) {
  return {
    id: message.id,
    url: `https://status.salesforce.com/generalmessages/${message.id}`,
    subject: message.subject,
    body: message.body,
    status: 'WARN'
  };
}

function formatStatus(status) {
  return {
    instance: status.key,
    environment: status.environment,
    release: status.releaseVersion,
    status: status.status
  };
}

async function getGeneralMessages() {
  const request = fetch('https://api.status.salesforce.com/v1/generalMessages', {
    method: 'get',
    headers: { 'Accept': 'application/json' }
  });
  const response = await request;
  const json = await response.json();
  return json;
}

async function getStatusPreviews() {
  const requests = env.INSTANCE_KEYS.map(key => {
    return fetch(`https://api.status.salesforce.com/v1/instances/${key}/status/preview`, {
      method: 'get',
      headers: { 'Accept': 'application/json' }
    });
  })
  const response = await Promise.all(requests);
  const json = await Promise.all(response.map(res => res.json()))
  return json;
}

function ignoreExcludedMessages(message) {
  if (env.EXCLUDED_STATUS_IDS.includes(message.id)) {
    message.status = 'IGNORED';
  }
  return message;
}

async function start() {

  let messages = await getGeneralMessages();
  messages = messages.filter(m => !m.endDate);
  messages = messages.map(formatMessage);
  messages = messages.map(ignoreExcludedMessages);

  let statuses = await getStatusPreviews();
  statuses = statuses.map(formatStatus);

  const anyAlerts = [...messages, ...statuses].some(item => item.status === 'WARN');
  const overallColor = anyAlerts ? COLORS['WARN'] : COLORS['OK'];

  console.log(`☁ | color=${overallColor}`)
  console.log('---');

  console.log('General Messages | color=black')
  messages.forEach(o => {
    console.log(`[${o.id}] ${o.subject} | href=${o.url} color=${COLORS[o.status]}`);
  });
  console.log('---');

  console.log('Subscribed Instances | color=black')
  statuses.forEach(o => {
    console.log(`${o.instance} - ${o.environment} - ${o.release} | color=${COLORS[o.status]}`);
  });
}

start();
