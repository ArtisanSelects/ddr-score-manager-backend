import mongoose from "mongoose";
const { Schema } = mongoose;

var ScoreSchema = new Schema(
    {
        song: { type: Schema.Types.ObjectId, ref: "Song", required: true },
        date: { type: Date, default: Date.now },
        marvellous: { type: Number, required: true, min: 0 },
        perfect: { type: Number, required: true, min: 0 },
        great: { type: Number, required: true, min: 0 },
        good: { type: Number, required: true, min: 0 },
        boo: { type: Number, required: true, min: 0 },
        miss: { type: Number, required: true, min: 0 },
        ok: { type: Number, required: true, min: 0 },
        combo: { type: Number, required: true, min: 0 },
        score: { type: Number, required: true, min: 0, max: 1000000 },
        grade: { type: String, required: true, enum: ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'E'] },
        status: { type: String, required: true, enum: ['MFC', 'PFC', 'GFC', 'GoFC', 'Cleared', 'Unplayed'], default: 'Unplayed' },
    }
);

ScoreSchema.virtual('url').get(function() { return '/score/'+this._id; });

export default mongoose.model('Score', ScoreSchema);