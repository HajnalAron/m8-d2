import mongoose from "mongoose";
const { model, Schema } = mongoose;
const authorsSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "author"],
    default: "author"
  },
  blogposts: [{ type: Schema.Types.ObjectId, ref: "BlogPost" }]
});

authorsSchema.methods.toJSON = function () {
  const authorDocument = this;
  const authorObject = authorDocument.toObject();
  delete authorObject.password;
  delete authorObject.__v;

  return authorObject;
};

export default model("Author", authorsSchema);
