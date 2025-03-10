require('dotenv').config();
import express from 'express';
import session from 'express-session';
import passport from './middlewares/passport';
import route from './routes/index';
const app = express();
import cors from 'cors';
import pgSession from "connect-pg-simple";
import path from 'path'
import pool from './config/db';
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

const PgSession = pgSession(session);
app.use(
  session({
    store: new PgSession({
      pool, // ✅ Use the existing PostgreSQL pool
      tableName: "user_sessions", // ✅ Ensure the 'session' table exists in your DB
    }),
    secret: process.env.SESSION_SECRET || 'SECRET',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 6, // 6 days
      secure: false,
      httpOnly: true,
    },
  })
);


app.use("/uploads", express.static(path.join(__dirname, "middlewares/storage")));

app.use(passport.initialize());
app.use(passport.session());


app.use('/', route);

app.listen(process.env.NODE_PORT, () => {
    console.log(`Server Listening on ${process.env.NODE_PORT}`)
})