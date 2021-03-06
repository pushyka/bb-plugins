#!/Users/garethwilson/.nvm/versions/node/v14.0.0/bin/node
const fetch = require('node-fetch');

//todo add sandbboxes 
// instances = [prod, sb1, sb2 ..]

const COLORS = {
  'OK': 'green',
// orange and red for status
};

function processResponse(result) {

    const statusPreviews = result.map(r => {
        return {
            instance: r.key,
            environment: r.environment,
            release: r.releaseVersion,
            status: r.status,
            incidents: r.incidents,
            maintenances: r.maintenances
        };
    });


    statusPreviews.forEach(statusPreview => {
        // ⚠️
        console.log(`${statusPreview.instance} | color=${COLORS[statusPreview.status]}`);
        console.log('---');
        console.log(`${statusPreview.environment}`);
        console.log(`${statusPreview.release}`);
        console.log('---');
    });




  // for each result print down with pipe dividers..
  // 

}

function printLine(requestBody) {
  const { start_time, reponame, job_name, committer_name, subject, color } = requestBody;
  console.log(`${start_time} (${reponame}:${job_name}) ${committer_name} - ${subject} | color=${color}`);
}



async function start() {

    const ap1 = fetch('https://api.status.salesforce.com/v1/instances/ap1/status/preview', {
      method: 'get',
      headers: { 'Accept': 'application/json' }
    });

    // add its sandboxes

    const cs121 = fetch('https://api.status.salesforce.com/v1/instances/cs121/status/preview', {
      method: 'get',
      headers: { 'Accept': 'application/json' }
    });

    const arr = [ap1, cs121];

    let result = await Promise.all(arr)
    result = await Promise.all(result.map(r => r.json()))

   processResponse(result);
}

start();
