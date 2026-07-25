# High-Performance E-Commerce Engine with AI Vector Search

A modern MERN stack monorepo project.

## Folder Structure
- `client/`: React 19 + Vite + TypeScript + Tailwind CSS
- `server/`: Node.js + Express + TypeScript

## Installation
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

## Running locally
```bash
# Start client
cd client
npm run dev

# Start server
cd ../server
npm run dev
```

## API Documentation

The server exposes the following RESTful API endpoints at `http://localhost:5000/api`:

### Auth Endpoints
- `POST /api/auth/register` - Register a new user (Requires: name, email, password)
- `POST /api/auth/login` - Authenticate user & get token (Requires: email, password)

### Product Endpoints
- `GET /api/products` - Fetch all products
- `GET /api/products/:id` - Fetch single product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Postman Collection

For easy API testing, a Postman collection has been included in the repository.
You can import `ecommerce-postman-collection.json` into your Postman workspace to quickly access and test all the available endpoints.

## Database Seeding

To quickly populate your database with 1000 demo products, ensure your `.env` contains a valid `MONGO_URI` and run:
```bash
cd server
npm run data:import
```
To clear the products from the database:
```bash
cd server
npm run data:destroy
```
