# News From The Northcoders API

Welcome to the Northcoders News API! This project serves as the backend API for Northcoders News, providing the following endpoints topics, articles, and comments.

### Getting Started & Installation

## Requirements

To run this API on your machine, you will need Node.js and Postgres installed on your machine.

To install Postgres, go to: https://www.postgresql.org/download/
The version required is a minimum of v. 12.1

To install Node, go to: https://nodejs.org/en/download/
The version required is a minimum of v. 13.8.0

## Installation

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

1.Clone a copy of the repository on your machine using the below command:

```
git clone https://github.com/asme10/nc-news-api
```

2. Install the required dependencies:
   
   ```
   npm install
   ```

### Setting Up The Database

1.Setup the database by running the below script:

```
  npm run setup-dbs
```

2.Setup the database by running the below script:

```
  npm run seed
```

### Environment Variables

1.To store configuration settings that control how an application behaves.

```
 .env.development
 .env.test
```

### Running the Tests

1.To run the tests written for the API during the TDD process (including tests for error handling), run the following command:

```
  npm run test
```

2.To run the tests written for the utils functions, run the following command:

```
  npm run test-utils
```

## Built With

This project was built using the following technologies:

- [Node.js](https://nodejs.org/) - JavaScript server-side runtime environment
- [Express](https://expressjs.com/) - Node.js web application server framework
- [PostgreSQL](https://www.postgresql.org/) - Open source object-relational database system
