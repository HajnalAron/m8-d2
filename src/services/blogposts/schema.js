import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    user_name: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

const blogPostSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      type: Object,
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        required: true
      }
    },
    authors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Author"
      }
    ],
    content: { type: String, required: true },
    comments: [commentSchema]
  },
  {
    timestamps: true
  }
);

export default model("BlogPost", blogPostSchema);
