import Mongoose from "mongoose";
import bcrypt from "bcrypt";

const { model, Schema } = Mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  },
  refreshToken: { type: String }
});

UserSchema.pre("save", async function (next) {
  const newUser = this;
  const plainPassword = newUser.password;

  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(plainPassword, 10);
  }
});

UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject._v;
  delete userObject.refreshToken;
  return userObject;
};

UserSchema.statics.checkValidity = async function (loginData) {
  console.log(loginData);
  const { email, password } = loginData;
  const user = await this.findOne({ email });
  if (user) {
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) return user;
    else return false;
  } else return false;
};

export default model("User", UserSchema);
