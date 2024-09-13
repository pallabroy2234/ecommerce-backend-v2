# E-commerce Backend - MERN Stack Project

This repository contains the backend API for the full-stack e-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). The backend handles user authentication, product management, order processing, payment integration with **Stripe**, image handling via **Cloudinary**, and also implements a caching system using **Node Cache**.


Frontend code and details are managed in a separate repository.
### [Frontend Repository](https://github.com/pallabroy2234/ecommerce-frontend-v2.git)
### [Live Demo Frontend](https://ecom-frontend-v2-b7a6fa88076b.herokuapp.com/)
> **Note:** The frontend is hosted on **Heroku**, and the backend is hosted on **Heroku**'s free hosting.  
> _The backend server may take some time to start up if it has been inactive for a while._


## Features

- **User Authentication:** Secure authentication and authorization using Firebase.
- **Product Management:** Create, read, update, and delete (CRUD) operations for products.
- **Order Management:** Handle user orders, including placing orders, viewing past orders, and tracking order status.
- **Payment Integration:** Process payments using Stripe.
- **Image Management:** Upload and manage product images using Cloudinary.
- **Real-time Notifications:** Handle order confirmations and alerts with real-time feedback.
- **API Documentation:** Generated using Swagger.

## Technologies Used

- **Node.js**: ^20.0.0
- **Express.js**: ^4.19.2 - Framework for building the API.
- **MongoDB & Mongoose**: ^8.4.1 - Database and object modeling.
- **Cloudinary**: ^2.4.0 - Cloud-based image management.
- **Stripe**: ^16.7.0 - Payment gateway integration.
- **Winston**: ^3.13.0 - Logging system.
- **Multer**: ^1.4.5-lts.1 - File upload handling.
- **Swagger**: ^6.2.8 - API documentation.
- **Node Cache**: ^5.1.2 - Cache system. 

## Installation

### Prerequisites

Ensure you have the following installed on your system:

- Node.js
- npm (or yarn)
- MongoDB (local or remote instance)
- Firebase account (for authentication)
- Stripe account (for payment integration)
- Cloudinary account (for image uploads)

### Clone the repository

```bash
git clone https://github.com/pallabroy2234/ecommerce-frontend-v2.git/server
cd server
```
### Environment Variables
| Environment Variable              | Description                                 |
|-----------------------------------|---------------------------------------------|
| `PORT`                            | The port on which the server will run.      |
| `MODE`                            | Application mode (`development`, `production`). |
| `DEVELOPMENT_DATABASE_NAME`       | Name of the database used in development.   |
| `DEVELOPMENT_DATABASE_URL`        | MongoDB URL for the development database.   |
| `PRODUCTION_DATABASE_NAME`        | Name of the database used in production.    |
| `PRODUCTION_DATABASE_URL`         | MongoDB URL for the production database.    |
| `STRIPE_SECRET_KEY`               | Secret key for Stripe payment processing.   |
| `PRODUCTS_LIMIT`                  | Maximum number of products displayed per page. |
| `CLOUDINARY_CLOUD_NAME`           | Cloud name for Cloudinary image hosting.    |
| `CLOUDINARY_API_KEY`              | API key for Cloudinary.                     |
| `CLOUDINARY_API_SECRET`           | API secret for Cloudinary.                  |
