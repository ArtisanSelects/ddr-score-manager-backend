import mongoose from "mongoose";
const { Schema } = mongoose;

var MiscScoreSchema = new Schema(
    {
        caption: { type: String, required: true},
        screenshot: { type: Buffer, required: true },
        date: { type: Date, default: Date.now },
    }
)

export default mongoose.model('MiscScore', MiscScoreSchema);