# News From The Northcoders API

Welcome to the Northcoders News API! This project serves as the backend API for Northcoders News, providing  the following endpoints: 

#  Overview Of Endpoints
```
GET /api/topics
GET /api
GET /api/articles/:article_id
GET /api/articles
GET /api/articles/:article_id/comments
POST /api/articles/:article_id/comments
PATCH /api/articles/:article_id
DELETE /api/comments/:comment_id
GET /api/users
GET /api/articles (queries)
GET /api/articles/:article_id (comment count)
```

## Getting Started

To run this project locally, follow these steps:

1. **Clone the Repository:**
   - Clone this repository to your local machine:
     ```bash
     git clone https://l2c.northcoders.com/courses/be/nc-news
     ```
   - Navigate to the project directory:
     ```bash
     cd nc-news-api
     ```

2. **Create .env Files:**
   - In the root directory, create two `.env` files: `.env.test` and `.env.development`.
   - Open `.env.test` and add the following line, replacing `your_test_database_name` with your test database name:
     ```
     PGDATABASE=your_test_database_name
     ```
   - Open `.env.development` and add the following line, replacing `your_development_database_name` with your development database name:
     ```
     PGDATABASE=your_development_database_name
     ```
   - Make sure to configure your databases according to your PostgreSQL setup.

3. **Install Dependencies:**
   - Run the following command to install project dependencies:
     ```bash
     npm install
     ```

4. **Set Up Databases:**
   - Use the provided SQL script to set up your databases. In your terminal, run:
     ```bash
     npm run setup-dbs
     ```

5. **Seed Databases:**
   - Seed the databases with sample data by running:
     ```bash
     npm run seed
     ```
