import express from "express";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import AuthorModel from "./schema.js";
import BlogPostModel from "../blogposts/schema.js";

const authorsRouter = express.Router();

authorsRouter
  .route("/")
  .post(async (req, res, next) => {
    try {
      const hashedPass = await bcrypt.hash(req.body.password, 10);
      const newAuthor = await new AuthorModel({
        ...req.body,
        password: hashedPass
      }).save();
      res.send(newAuthor);
    } catch (error) {
      next(error);
    }
  })
  .get(async (req, res, next) => {
    try {
      const authors = await AuthorModel.find().populate("blogposts");
      res.send(authors);
    } catch (error) {
      next(error);
    }
  });

authorsRouter
  .route("/:authorId")
  .get(async (req, res, next) => {
    try {
      const author = await AuthorModel.findById(req.params.authorId).populate(
        "blogposts"
      );
      if (author) {
        res.send(author);
      } else {
        next(
          createHttpError(
            404,
            `Author with the id of: ${req.params.authorId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  })
  .put(async (req, res, next) => {
    try {
      const targetAuthor = await AuthorModel.findByIdAndUpdate(
        req.params.authorId,
        req.body,
        { new: true }
      );
      if (targetAuthor) {
        res.send(targetAuthor);
      } else {
        next(
          createHttpError(404),
          `Author not found with the id of ${req.params.authorId}`
        );
      }
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const deletedAuthor = await AuthorModel.findByIdAndDelete(
        req.params.authorId
      );
      if (deletedAuthor) {
        res.status(204).send();
      } else {
        next(
          createHttpError(404),
          `Author not found with the id of ${req.params.authorId}`
        );
      }
    } catch (error) {
      next(error);
    }
  });

authorsRouter.route("/:authorId/blogposts").post(async (req, res, next) => {
  try {
    console.log(req.body._id);
    const targetAuthor = await AuthorModel.findByIdAndUpdate(
      req.params.authorId,
      { $push: { blogposts: req.body } }
    );
    const targetBlogPost = await BlogPostModel.findByIdAndUpdate(req.body._id, {
      $push: { authors: { _id: req.params.authorId } }
    });
    res.send({ targetAuthor, targetBlogPost });
  } catch (error) {
    next(error);
  }
});
export default authorsRouter;
