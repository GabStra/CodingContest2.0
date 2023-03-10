import express, { Express, Request, Response } from "express";
import { CppService } from "./cpp_service";
import dotenv from "dotenv";
import { CppRequest } from "../../Shared/compiled_proto/cpp";
import cors from "cors";
import fs from "fs/promises";
import bcrypt from "bcrypt";

import { TblUsers } from "./database/entities/TblUsers";
import { Login } from "../../Shared/models/login";
import { Auth } from "../../Shared/models/auth";
import cookieParser from "cookie-parser";
import dayjs from "dayjs";
import { AppDataSource } from "./database/datasource";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
//test
const config = {
  type: "mariadb",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "root",
  database: "codingcontest2",
  synchronize: false,
  entities: ["**/entities/*.js"],
};
const app: Express = express();
const port = Number(process.env.PORT);

AppDataSource.initialize()
  .then(async () => {
    console.log("Connection initialized with database...");
  })
  .catch((error) => console.log(error));

//RETRY
let cppService = new CppService();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.post("/run-cpp", async (res, req, next) => {
  let cppRequest: CppRequest = res.body;
  req.send(await cppService.runCpp(cppRequest));
});

app.post("/stop-cpp", async (res, req, next) => {
  let cppRequest: CppRequest = res.body;
  let result = await cppService.stopTask(cppRequest.id);
  req.send(result);
});

app.get("/get-base-code", async (req, res) => {
  let top = await fs.readFile("static/top.cpp", "utf8");
  let bottom = await fs.readFile("static/bottom.cpp", "utf8");
  let start = await fs.readFile("static/start.cpp", "utf8");

  res.send({
    start: start,
    top: top,
    bottom: bottom,
  });
});

app.post("/login", async (req: Request, res) => {
  if (!!req.cookies.auth) {
    console.log(req.cookies.auth);
    res.sendStatus(200);
    return;
  }

  //TODO VERIFY REQUEST
  let login = req.body as Login;

  if (!!req.cookies.auth) {
    let email = req.cookies.auth.split(":")[0];
    let userRepo = AppDataSource.getRepository(TblUsers);
    let db = await userRepo.findOneBy({
      userEmail: email,
    });
    console.log(req.cookies.auth);
    let hash = await bcrypt.hash(req.cookies.auth, +process.env.AUTH_SECRET);
    res.sendStatus(hash === db.tokenCode ? 200 : 401);
    return;
  }

  let userRepo = AppDataSource.getRepository(TblUsers);
  let db = await userRepo.findOneBy({
    userEmail: login.email,
  });

  //TODO ADD HASH
  if (!db || login.password !== db.userPass) {
    res.sendStatus(401);
    return;
  }

  if (login.rememberMe) {
    let code = login.email + ":" + uuidv4();
    let hash = await bcrypt.hash(uuidv4(), +process.env.AUTH_SECRET);
    db.tokenCode = hash;
    await userRepo.save(db);
    res.cookie("auth", code, {
      httpOnly: true,
      expires: dayjs().add(1, "month").toDate(),
    });
  }

  res.sendStatus(200);
});

app.listen(port);
