# push-to-prod

> A GitHub App built with [Probot](https://github.com/probot/probot) that An app that automatically maintains tickets in line with code changes. 

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t push-to-prod .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> push-to-prod
```

## Contributing

If you have suggestions for how push-to-prod could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2025 Tyler Cross
