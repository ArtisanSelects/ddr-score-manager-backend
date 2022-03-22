import mongoose from "mongoose";
const { Schema } = mongoose;

var SongSchema = new Schema(
    {
        title: { type: String, required: true},
        artist: { type: String, required: true},
        score: { type: Schema.Types.ObjectId, ref: "Score"},
        scoreHistory: [{type: Schema.Types.ObjectId, ref: "Score"}],
        difficulty: { type: Number, required: true, min: 1, max: 20},
        difficultyRank: { type: Number, required: true, min: 0 },
        chartDifficulty: { type: String, required: true, enum: ["Beginner", "Basic", "Difficult", "Expert", "Challenge"]},
        chartMode: { type: String, required: true, enum: ["Single", "Double"]},
        appearance: { type: String, required: true, enum: ['1st Mix', '2nd Mix', '3rd Mix', '4th Mix', '5th Mix', 'MAX', 'MAX2', 'EXTREME', 'SuperNOVA', 'SuperNOVA2', 'DDR X', 'DDR X2', 'DDR X3', 'DDR 2013', 'DDR 2014', 'DDR A', 'DDR A20', 'DDR A20 PLUS', 'DDR A3', 'Other']},
        maxCombo: { type: Number, required: true, min: 1 },
        freezeArrowCount: { type: Number, required: true, min: 0 },
        shockArrowCount: { type: Number, required: true, min: 0 },
        freezeAndShockArrowCount: { type: Number, required: true, min: 0 },
        stepScore: { type: Number, required: true, min: 0 },
        songJacket: { type: Buffer, required: true },
    }
)

SongSchema.virtual('url').get(function() { return '/songs/'+this._id; });

export default mongoose.model('Song', SongSchema);