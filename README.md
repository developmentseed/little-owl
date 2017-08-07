# 🦉 little-owl [![npm version](https://badge.fury.io/js/little-owl.svg)](https://badge.fury.io/js/little-owl)

A library of helper functions to query AWS Athena.

## Installation
```
npm install little-owl
```

## Usage
```javascript
const owl = require('little-owl')({
  accessKeyId: 'MY_AWS_ACCESS_KEY',
  secretAccessKey: 'MY_AWS_SECRET_KEY'
});

owl.runQuery('SELECT * from owls', function (err, data) {
  if (!err) {
    console.log(data);
  }
});
```

## API 
### constructor([options])

Options is an object with the following keys:

- accessKeyId: AWS access key
- secretAccessKey: AWS secret key
- region: AWS region (default is `us-east-1`)
- outputBucket: AWS S3 bucket to use for output results, default is `little-owl-athena-output`
- spinner: whether to render a spinner in the TTY

### runQuery(query, callback)

- query is an ANSI SQL string to send to AWS Athena
- callback is of the form `function (err, results)` where results is an array of rows. The first row is the header.

## CLI
`little-owl` also ships with a command line tool. Install it with `npm install -g little-owl`

The cli requires the following environment variables to be set:

- `AWS_REGION`: Region where the S3 bucket and Athena queries will run (default is `us-east-1`)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_OUTPUT_BUCKET`: Bucket where query results are stored (default is `little_owl_athena_output`)

```
Usage
  $ little-owl query <sql>
  $ echo <sql> | little-owl query

Examples
  $ little-owl query "SELECT count(*) from owls"
```

## License
MIT - See [LICENSE.md](LICENSE.md)
