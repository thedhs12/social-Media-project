# Social-media (Nest JS)

## Tech Stack
- **Frontend:** React, TypeScript, Vite
- **Backend:** Nestjs
- **Database:** PostgreSQL
- **Authentication:** Passport.js with a JWT strategy

## Setup Instructions

### 1. Clone the repository
git clone https://github.com/thedhs12/social-Media-project.git


### 2. Setup Backend
cd social-media
npm install
npm run start:dev

create a ".env" file inside backend folder:
 
 PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=social_media_db

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h


### 3.Setup Frontend
cd social-media-frontend
npm install
npm run dev

by default,the frontend runs at http://localhost:5173/