# 🔒 SecureNote

SecureNote is a web application for taking notes with Token-based Authentication. Users must provide a valid SECRET_TOKEN before they can create, update, or delete notes.

- ✨ Features
- 🔐 Token-based Authentication
- 📝 Full CRUD (Create / Read / Update / Delete Notes)
- 🚫 No localStorage (per requirement)
- 🌐 Connected to real backend (Node.js + Express)
- 📡 HTTP Request Debug Log
- 🎨 Clean and responsive UI
- ⚡ Real-time Token Validation

##  Project Structure

```
project/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## ⚙️ Installation

1. Clone project

```sh
git clone https://github.com/Poppipappa/WebSecureNote
cd project
```

2. Setup Backend

```sh
cd backend
npm install
```

Create a .env file:

```
PORT=3001
SECRET_TOKEN=your_secret_token_here
```

3. Run Server

```sh
npm run dev
```

or

```sh
npm start
```


## 🌐 Frontend Usage

Open:

```sh
frontend/index.html
```

(You can also use Live Server)

## 🔑 Authentication Flow

- User enters token in the Authorization Token field
- Frontend sends request header:

```sh
Authorization: Bearer <token>
```

- Backend validates using middleware:

```sh
if (token !== SECRET_TOKEN) {
  return res.status(401)
}
```

## 📡 API Endpoints

## 🔓 Public

| Method |  Endpoint  |  Description  |
|:------:|:----------:|:-------------:|
| GET    | /api/notes | Get all notes |

## 🔐 Protected (Requires Token)

| Method |     Endpoint    |   Description  |
|:------:|:---------------:|:--------------:|
| GET    | /api/auth/check | Validate token |
| POST   | /api/notes      | Create note    |
| PATCH  | /api/notes/:id  | Update note    |
| DELETE | /api/notes/:id  | Delete note    |

## 👨‍💻 Author
Bootsaraphorn Mitthisorn 66011409
