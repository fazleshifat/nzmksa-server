# Absher Backend

Express.js + TypeScript + MongoDB + Cloudinary backend for the private employee mobile application.

## 1. Install

npm install

## 2. Environment

Copy `.env.example` to `.env` and add:

- MongoDB connection string
- JWT secret
- Cloudinary credentials
- frontend URL

## 3. Run development server

npm run dev

## 4. Build

npm run build

## 5. Start production

npm start

## API

POST /api/auth/login

Body:

{
  "residentIdNumber": "2600976498",
  "password": "Aa123456"
}

GET /api/auth/me

Header:

Authorization: Bearer YOUR_TOKEN

GET /api/employees/me

Header:

Authorization: Bearer YOUR_TOKEN

GET /api/employees

Header:

Authorization: Bearer YOUR_TOKEN

POST /api/uploads/employee-image

Content-Type: multipart/form-data

Fields:

image: image file
type: avatar OR iqama

## Notes

- Passwords are hashed with bcrypt.
- Password is never returned by API.
- JWT is used for authentication.
- Employee image and Iqama image URLs are stored in MongoDB.
- Actual image files are stored in Cloudinary.
- Cloudinary public IDs are kept privately in MongoDB so old images can be replaced/deleted.
