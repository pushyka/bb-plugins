#!/Users/garethwilson/.nvm/versions/node/v14.0.0/bin/node
// todo fix this ^

const request = require('request');
const env = require('../env.js'); // can't use dotenv since loads from the bitbar app root

const COLORS = {
  'running': 'aqua',
  'success': 'green',
  'failed': 'red',
  'timedout': 'white',
  'canceled': 'white',
  'scheduled': 'white',
  'no_tests': 'white',
  'queued': 'blue',
  'not_running': 'blue'
};

function processResponse(body) {
  const recentBuilds = JSON.parse(body);
  const formattedBuilds = [];
  recentBuilds.forEach((build) => {
    const formattedBuild = {
      start_time: build.start_time,
      stop_time: build.stop_time,
      reponame: build.reponame,
      job_name: build.workflows.job_name, 
      committer_name: build.committer_name,
      subject: build.subject && build.subject.substring(0, 16),
      color: COLORS[build.status]
    };
    formattedBuilds.push(formattedBuild);
  });

  const orderedBuilds = orderBuilds(formattedBuilds);
  orderedBuilds.forEach((build, index) => {
    printLine(build);
    if (index === 0) {
      console.log('---');
    }
  });
  console.log('---');
  console.log(`Open dashboard | href=https://app.circleci.com/pipelines/github/${env.CIRCLE_REPO}`);
}

function printLine(requestBody) {
  const { reponame, job_name, color } = requestBody;
  console.log(`${reponame}:${job_name} | color=${color}`);
}

// stop date desc, with nulls first
function orderBuilds(formattedBuilds) {
  formattedBuilds.sort(function(a, b) {
    if (a.stop_time === null) {
      return -1;
    } else if (b.stop_time === null) {
      return 1;
    } else {
      const dateA = new Date(a.stop_time);
      const dateB = new Date(b.stop_time);
      return dateB - dateA;
    }
  });
  return formattedBuilds;
}

async function start() {
  const options = {
    method: "GET",
    url: "https://circleci.com/api/v1.1/recent-builds?limit=5&shallow=true",
    headers: { "Circle-Token": env.CIRCLE_TOKEN, "Accept": "application/json"},
  };
  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    processResponse(body);
  });
}

start();
