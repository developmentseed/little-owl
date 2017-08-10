# 🦉 little-owl [![npm version](https://badge.fury.io/js/little-owl.svg)](https://badge.fury.io/js/little-owl)

Helper tools to query AWS Athena.

```
npm install little-owl
```
## Documentation
`little-owl` can be used either as a command line tool or as a node library.

### CLI

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

### [Node API](docs/NODE_API.md)

## License
MIT - See [LICENSE.md](LICENSE.md)
