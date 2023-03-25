import "express-async-errors"  // en yukarda import edilmesi önemli olabilir
import morgan from "morgan"
import express from 'express';
const app = express();

//-----BUILD ----///
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
//-----BUILD ----///

/// security packages ///
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
/// security packages ///

/// cookie-parser packages ///
import cookieParser from "cookie-parser"

import dotenv from 'dotenv';
dotenv.config();

// db and authenticateUser
import connectDB from './db/connect.js';

// routes
import authRouter from './routes/authRoutes.js';
import jobsRouter from "./routes/jobsRoutes.js"

// middleware
import notFoundMiddleware from './middleware/not-found.js'; // sonuna .js yazmayı unutma
import errorHandlerMiddleware from './middleware/error-handler.js';
import authenticateUser from "./middleware/auth.js";

if(process.env.NODE_ENV !== "production"){  // terminalde ayrıntılı log bilgisi veriyor. POST /api/v1/auth/register 400 184.136 ms - 30
  app.use(morgan("dev"))
}

//-----BUILD ----///
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname,"./client/build")))
//-----BUILD ----///

app.use(express.json());
/// cookie-parser packages ///
app.use(cookieParser())
/// security packages ///
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
/// security packages ///


// app.get('/', (req, res) => {
//   res.json({msg:'welcome'});
// });

app.get('/api/v1', (req, res) => {
  res.json({msg:'API'});
});

app.use('/api/v1/auth', authRouter); /* authRouter da sadece updateUser da "authenticateUser" ı kullanıcağımızdan  "authRouter.js" de ayarladık*/
app.use('/api/v1/jobs', authenticateUser, jobsRouter); /* bütün jobsRouter da  "authenticateUser" ı kullanıcaz  */

//-----BUILD ----///
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname,"./client/build","index.html"));
});
//-----BUILD ----///

app.use(notFoundMiddleware); // route larımızla uyuşmazsa burası çalışacak
app.use(errorHandlerMiddleware); // middleware ler arasında en alt satırda olmalı


const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
