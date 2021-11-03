import express from "express";
import createHttpError from "http-errors";
import User from "./schema.js";
import { generateTokens } from "../../tools/JWT.js";

const usersRouter = express.Router();

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = await new User(req.body).save();
    res.send(newUser);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const user = await User.checkValidity(req.body);
    if (user) {
      const { accessToken, refreshToken } = await generateTokens(user);
      res.send({ accessToken, refreshToken });
    } else next(createHttpError(401, "Wrong credentials"));
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
