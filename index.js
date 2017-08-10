require('dotenv').config();

let async = require('async');
let AWS = require('aws-sdk');
let athena = new AWS.Athena();

/**
 * An instance of the client.
 * @constructor
 * @param {object} opts - Options to the constructor
 * @param {string} opts.accessKeyId - AWS Access Key ID
 * @param {string} opts.secretAccessKey - AWS corresponding AWS secret key
 * @param {string} [opts.region=us-east-1] - AWS region
 * @param {string} [opts.outputBucket=s3://little-owl-athena-output] - S3 location to store the results of queries
 * @public
 * @example
 * const owl = require('little-owl')({
 *   accessKeyId: 'MY-AWS-ID',
 *   secretAccessKey: 'MY-AWS-SECRET'
 * })
 */
function owl(opts) {
  if (!(this instanceof owl)) return new owl(opts);

  this.athena = new AWS.Athena({
    accessKeyId: opts.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: opts.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
    region: opts.region || process.env.AWS_REGION || 'us-east-1'
  });
  
  this.outputBucket = opts.outputBucket || process.env.AWS_OUTPUT_BUCKET || 's3://little-owl-athena-output';
}

/**
 * Submit a query and waits until it returns.
 * @param {string} queryString - SQL statement
 * @param {submitQueryCallback} callback - node callback (err, queryId)
 * @public
 * @example
 * owl.submitQuery('SELECT * from owls', (err, queryId) => {
 *   if (!err) {
 *     console.log(queryId); // prints the query id
 *   }
 * });
 */
owl.prototype.submitQuery = function (queryString, callback) {
  let athena = this.athena;
  let QueryParams = {
    QueryString: queryString,
    ResultConfiguration: {
      OutputLocation: this.outputBucket 
    }
  }

  async.waterfall([
    // Start the query and get a queryId
    cb => athena.startQueryExecution(QueryParams, function (err, data) {
      if (err) cb(err);
      else {
        cb(null, data);
      }
    }),

    // Wait on the process
    (queryParams, cb) => {
      let isQueryStillRunning = true;
      async.whilst(
        // Test if query completed
        () => isQueryStillRunning,

        // Check query status
        innerCb => athena.getQueryExecution(queryParams, function (err, data) {
          if (err) innerCb(err)
          else {
            let status = data.QueryExecution.Status;
            let state = status.State
            if (state === "SUCCEEDED" || state === "FAILED" || state === "CANCELLED") {
              isQueryStillRunning = false;
            };

            // Wait 3 seconds
            setTimeout(() => innerCb(null, status), 3000)
          }

        }),

        // Return status
        (err, status) => {
          if (err) cb(err)
          else cb(null, {
            queryId: queryParams.QueryExecutionId,
            status
          })
        }
      )
    }],
    function (err, result) {
      if (err) callback(err)
      else {
        if (result.status.State === "FAILED" || result.status.State === "CANCELLED") {
          callback(new Error(result.status.StateChangeReason));
        }
        if (result.status.State === "SUCCEEDED") {
          callback(null, result.queryId)
        }
      }
    }
  )
}

/**
 * Get results from a submitted query. The results are an array of rows, each row an array of strings.
 * @param {string} queryId - Id of query
 * @param {getQueryResultCallback} callback - node callback (err, results) 
 * @public
 * @example
 * owl.getQueryResults('x2x4gas-12qwsd-a809', (err, results) => {
 *   if (!err) {
 *      console.log(results); // results is an array of rows
 *   }
 * });
 */
owl.prototype.getQueryResults = function (queryId, callback) {
  this.athena.getQueryResults({
    QueryExecutionId: queryId
  }, function (err, data) {
    // TODO process pagination
    if (err) callback(err)
    else {
      let mappedRows = data.ResultSet.Rows.map((row) => {
        return row.Data.map(rowItem => rowItem.VarCharValue)
      })
      callback(null, mappedRows);
    }
  });
}

/**
 * submitQueryCallback
 *
 * @callback submitQueryCallback
 * @param {Error} error - Reason the query failed if any
 * @param {string} queryId - Id of submitted Query
 * @private
 */

/**
 * getQueryResultCallback
 *
 * @callback getQueryResultCallback
 * @param {Error} error - Reason the query failed if any
 * @param {Array.<string[]>} results - Array of rows, each row an array of strings
 * @private
 */

module.exports = owl;
