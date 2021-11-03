import createHttpError from "http-errors";
import JWT from "jsonwebtoken";
import User from "../services/users/schema.js";

const generateAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    JWT.sign(
      payload,
      process.env.encryptionKey,
      { expiresIn: "15m" },
      (error, token) => {
        if (error) reject(error);
        else resolve(token);
      }
    )
  );

const generateRefreshToken = (payload) =>
  new Promise((resolve, reject) =>
    JWT.sign(
      payload,
      process.env.encryptionKey,
      { expiresIn: "1 week" },
      (error, token) => {
        if (error) reject(error);
        else resolve(token);
      }
    )
  );

export const generateTokens = async (user) => {
  const accessToken = await generateAccessToken({ _id: user._id });
  const refreshToken = await generateRefreshToken({ _id: user._id });

  user.refreshToken = refreshToken;
  user.save();

  return { accessToken, refreshToken };
};

export const verifyAccesToken = (token) =>
  new Promise((res, rej) =>
    JWT.verify(token, process.env.encryptionKey, (error, decodedToken) => {
      if (error) rej(error);
      else res(decodedToken);
    })
  );

export const verifyRefreshToken = (token) =>
  new Promise((res, rej) =>
    JWT.verify(token, process.env.encryptionKey, (error, decodedToken) => {
      if (error) rej(error);
      else res(decodedToken);
    })
  );

export const verifyAndRegenerateTokens = async (refreshToken) => {
  const decodedRefreshToken = await verifyRefreshToken(refreshToken);

  const user = await User.findById(decodedRefreshToken._id);

  if (!user) throw createHttpError(404, "User not found");

  if (user.refreshToken && user.refreshToken === refreshToken) {
    const { accessToken, refreshToken } = await generateTokens(user);

    return { accessToken, refreshToken };
  } else throw createHttpError(401, "Refresh token not valid!");
};
