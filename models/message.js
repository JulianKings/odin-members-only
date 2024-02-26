const mongoose = require('mongoose');
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    message: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "user", required: true },
    timestamp: { type: Date, required: true }
  });

messageSchema.virtual("formatted_timestamp").get(function() {
    return (this.timestamp ? DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED) : '')
});

module.exports = mongoose.model("message", messageSchema);