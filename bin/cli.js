#!/usr/bin/env node
let meow = require('meow');
let chalk = require('chalk');
let getStdin = require('get-stdin');
let Table = require('cli-table');

let owl = require('../')({
  spinner: true
});

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

function run (data) {
  if (!data) {
    console.log("Input required");
    cli.showHelp(1)
  }

  owl.runQuery(data, function (err, results) {
    if (!err) {
      let table = new Table({
        head: results.shift()
      });
      results.forEach(row => table.push(row));
      console.log(table.toString());
    }
  });
}

