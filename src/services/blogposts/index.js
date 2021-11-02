import express from "express";
import BlogPostModel from "./schema.js";
import createHttpError from "http-errors";

const blogPostRouter = express.Router();

blogPostRouter.post("/", async (req, res, next) => {
  try {
    const newBlogPost = new BlogPostModel(req.body);
    const { _id } = await newBlogPost.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

blogPostRouter.get("/", async (req, res, next) => {
  try {
    const blogPostsTotal = await BlogPostModel.countDocuments();
    const limit = Number(req.query.limit);
    const skip = Number(req.query.skip);
    console.log(skip);
    const blogPosts = await BlogPostModel.find()
      .skip(skip)
      .limit(limit || 5)
      .populate("authors");
    res.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

blogPostRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId;
    const blogPost = await BlogPostModel.findById(blogPostId);
    if (blogPost) {
      res.send(blogPost);
    } else {
      next(createHttpError(404, `BlogPost with id ${blogPostId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogPostRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId;
    const modifiedBlogPost = await BlogPostModel.findByIdAndUpdate(
      blogPostId,
      req.body,
      {
        new: true
      }
    );
    if (modifiedBlogPost) {
      res.send(modifiedBlogPost);
    } else {
      next(createHttpError(404, `BlogPost with id ${blogPostId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogPostRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId;
    const deletedBlogPost = await BlogPostModel.findByIdAndDelete(blogPostId);
    if (deletedBlogPost) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `BlogPost with id ${blogPostId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogPostRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    const targetBlogPost = await BlogPostModel.findById(req.params.blogPostId);
    if (targetBlogPost) {
      res.send(targetBlogPost.comments);
    } else
      next(
        createHttpError(
          404,
          `Blogpost with id ${req.params.commentId} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

blogPostRouter.get(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const targetBlogPost = await BlogPostModel.findById(
        req.params.blogPostId
      );
      if (targetBlogPost) {
        const targetComment = targetBlogPost.comments.find(
          (comment) => comment._id.toString() === req.params.commentId
        );
        if (targetComment) {
          res.send(targetComment);
        } else
          next(
            createHttpError(
              404,
              `Comment with id ${req.params.commentId} not found in blogpost's comments!`
            )
          );
      } else
        next(
          createHttpError(
            404,
            `Blogpost with id ${req.params.commentId} not found!`
          )
        );
    } catch (error) {
      next(error);
    }
  }
);

blogPostRouter.post("/:blogPostId/comments", async (req, res, next) => {
  try {
    const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
      req.params.blogPostId,
      { $: { comments: req.body } },
      { new: true }
    );
    if (updatedBlogPost) {
      res.send(updatedBlogPost);
    } else
      next(
        createHttpError(
          404,
          `Blogpost with id ${req.params.blogPostId} not found!`
        )
      );
  } catch (error) {
    next(error);
  }
});

blogPostRouter.put(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const targetBlogPost = await BlogPostModel.findById(
        req.params.blogPostId
      );
      if (targetBlogPost) {
        const index = targetBlogPost.comments.findIndex(
          (comment) => comment._id.toString() === req.params.commentId
        );
        if (index !== -1) {
          targetBlogPost.comments[index] = {
            ...targetBlogPost.comments[index].toObject(),
            ...req.body
          };
          await targetBlogPost.save();
          res.send(targetBlogPost);
        } else {
          next(
            createHttpError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `Blogpost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostRouter.delete(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostModel.findByIdAndUpdate(
        req.params.blogPostId,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true }
      );
      if (blogPost) {
        res.send(blogPost);
      } else
        next(
          createHttpError(
            404,
            `Blogpost  with id ${req.params.blogPostId} not found!`
          )
        );
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostRouter;
