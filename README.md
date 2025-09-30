# Bookbound 📚✨  
[![Made with MERN](https://img.shields.io/badge/stack-MERN-green)](#)  

_A cozy, modern reading tracker app inspired by a love of books and clean design._

---

## 🌟 Overview
**Bookbound** is a full-stack MERN application that helps readers keep track of what they want to read, what they’re currently reading, and what they’ve finished. With an inviting, book-themed design, it integrates directly with the **Open Library API** to make discovering and managing books effortless.

---

## ✨ Features
- 🔍 **Search Open Library** — instantly look up books by title, author, or keywords  
- ➕ **Personal Reading List** — add, track, and remove books with status  
- ⭐ **Ratings & Notes** — leave reflections on your books  
- ❤️ **Favorites** — curate a list of your top reads  
- 📱 **Mobile-Friendly** — responsive, modern UI styled with a cozy reading vibe  
- 🔐 **Auth (JWT)** — secure sign-up and login for personalized lists  

---

## 🖼️ Screenshots
- **Landing Page** – welcoming hero image with CTA  
- **Search** – live book lookup with Open Library covers  
- **Reading List** – track progress with notes and ratings  


---

## 🛠️ Technologies
### Frontend
- React + Vite  
- React Router  
- CSS

### Backend
- Node.js + Express  
- MongoDB + Mongoose  
- JWT Authentication (jsonwebtoken, bcrypt)  

### Other
- Open Library API (book data + covers)  
- Heroku (deployment)  
- Morgan, dotenv, Helmet, CORS  

---

### 🔮 Future Improvements
- 📖 Book categories & tags
- 👥 Social features (share lists, follow friends)
- 📊 Reading stats & progress tracker
- 📅 Calendar / reading schedule integration

---
## Try It Here!

[![Heroku](https://img.shields.io/badge/demo-heroku-purple?logo=heroku)](https://your-heroku-app-url-here)  

---

## 🚀 Getting Started
1. **Clone the repo**
   ```
   git clone https://github.com/Xugknight/bookbound.git
   cd bookbound
   ```
2. **Install Dependencies**
    ```
    npm install
    npm --prefix ./frontend install
    ```

3. **Create a ```.env``` file in the project root:**
    ```
    MONGODB_URI=your_mongodb_uri
    SECRET=your_session_secret
    ```

4. **Run Locally**
    ```
    npm run build     # build frontend
    npm start         # start Express backend
    ```

5. **Open http://localhost:3000🎉**

    ---