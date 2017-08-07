require('dotenv').config();

let ora = require('ora');

function Owl(opts) {
  if (!(this instanceof Owl)) return new Owl(opts);
  let outputBucket = opts.outputBucket || process.env.AWS_OUTPUT_BUCKET || 's3://little-owl-athena-output';

  this.query = require('./lib/query')({
    credentials: {
      accessKeyId: opts.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: opts.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
    },
    region: opts.region || process.env.AWS_REGION || 'us-east-1',
    outputBucket
  });

  let isOraEnabled = opts.spinner && (opts.spinner === true);
  this.spinner = ora({enabled: isOraEnabled});
}

Owl.prototype.runQuery = function (sql, callback) {
  let owl = this;
  let spinner = this.spinner;
  spinner.text = 'Running query';
  spinner.start();

  owl.query.submitQuery(sql, function (err, queryId) {
    if (err) {
      spinner.fail(err);
      callback(err);
    }
    else {
      spinner.text = 'Reading output';
      owl.query.getQueryResults(queryId, function (err, rows) {
        if (err) {
          spinner.fail(err);
        }
        else {
          spinner.succeed();
          callback(null, rows);
        }
      })
    }
  })
}

module.exports = Owl;
