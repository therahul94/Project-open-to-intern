const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const internSchema = new mongoose.Schema(
{

    name: {

      type: String,
      required: true,
      trim: true

    },

    email: {

      type: String,
      required: true,
      lowercase: true,
      //     valid email,
      unique: true,
      trim: true

    },

    mobile: {

      type: String,
      required: true,
      // valid mobile number,
      unique: true,
      trim: true

    },

    collegeId: {

      type: ObjectId,
      refs: collegeCollection

    },

    isDeleted: {

      type: Boolean,
      default: false

    }

},{ timestamps: true });

module.exports = mongoose.model("internCollection", internSchema);
