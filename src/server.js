import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import blogPostRouter from "./services/blogposts/index.js";
import authorsRouter from "./services/authors/index.js";

const server = express();

const { PORT = 5000 } = process.env;

server.use(cors());
server.use(express.json());
server.use("/blogposts", blogPostRouter);
server.use("/authors", authorsRouter);

mongoose.connect(process.env.CONNECTION_STRING);

mongoose.connection.on("connected", () => {
  server.listen(PORT, async () => {
    console.log("Server is listening on port " + PORT);
    console.log(listEndpoints(server));
  });
});

server.on("error", (error) => {
  console.log("Server is stoppped ", error);
});
