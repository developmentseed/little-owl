🦉 `little-owl` is a library of helper functions to query AWS Athena

## Installation
```
npm install little-owl
```

## Usage

Currently to use the `query` command you should manually setup an Athena database and osm tables. The cli requires the following environment variables to be set:

- `ATHENA_PREFIX`: A namespace for the database and database tables.
- `AWS_REGION`: Region where the S3 bucket and Athena queries will run
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_OUTPUT_BUCKET`: Bucket where query results are stored

### API 

### CLI
`little-owl` also ships with a command line tool. 

Install it with `npm install -g little-owl`

```
Usage
  $ little-owl query <sql>
  $ echo <sql> | little-owl query

Examples
  $ little-owl query "SELECT count(*) from osm.changesets"
```

## License
MIT - See [LICENSE.md](LICENSE.md)
