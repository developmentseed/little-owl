#!/usr/bin/env node
let meow = require('meow');
let chalk = require('chalk');
let getStdin = require('get-stdin');
let ora = require('ora');
let csvWriter = require('csv-write-stream');
let async = require('async');

let usage = `
Usage
  $ little-owl query <sql>
  $ echo <sql> | little-owl query

Examples
  $ little-owl query "SELECT count(*) from osm.changesets"
`;

let cli = meow(usage);

if (cli.input[0] === 'query') {
  if (process.stdin.isTTY) {
    let sql = cli.input[1];
    run(sql);
  } else {
    getStdin().then(data => run(data));
  }
}

if (cli.input.length < 1) {
  cli.showHelp(1);
}

function runQuery(sql, callback) {
}

function loop(nextToken) {
  let opts = {};
  if (nextToken) {
  
  }

}

function run (sql) {
  if (!sql) {
    console.error("Input required");
    cli.showHelp(1)
  }

  let owl = require('../')({});
  let spinner = ora({});
  spinner.text = 'Running query';
  spinner.start();

  let startTime = Date.now();

  owl.submitQuery(sql, function (err, queryId) {
    if (err) {
      spinner.fail(err);
    }
    else {
      // Setup for iterator
      let nextToken;
      let writer;
      let runNumber = 1;

      // Iterate
      async.doWhilst(
        function (callback) {
          spinner.start(`${runNumber}/x Reading output`); 

          opts = {};
          if (nextToken !== undefined) {
            opts.nextToken = nextToken;
          }

          owl.getQueryResults(queryId, opts, function (err, data) {
            let results = data.results;

            if (runNumber === 1) {
              // Define a CSV writer
              writer = csvWriter({headers: results.shift()});
              writer.pipe(process.stdout);
            }

            if (!err) {
              if (process.stdout.isTTY) {
                process.stdout.write('\n');
              }
              data.results.forEach(row => writer.write(row));
              nextToken = data.nextToken;
              runNumber++;
              callback(null);
            } else {
              callback(err);
            }
          });
        },

        function () { return (nextToken !== undefined); },

        function (err) {
          writer.end();
          if (err) {
            spinner.fail(err);
          }
          else {
            spinner.succeed(`Done in ${(Date.now() - startTime)/1000}s.`);
          }
        }
      );
    }
  });
}

