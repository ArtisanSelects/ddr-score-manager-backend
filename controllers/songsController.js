import Song from '../models/song.js';
import Score from '../models/score.js';
import { body, check, validationResult } from "express-validator";

export default class SongsController {

    static async song_list(req, res) {
        try {
            const songList = await Song.find().populate('score').populate('scoreHistory').select("-songJacket");
            res.json(songList);
        } catch (err) {
            res.status(500).send([{ param: 'song', msg: 'Unable to find songs.'}]);
        }
    }

    static async song_jacket_get(req, res) {
        try {
            let id = req.params.id;
            const requestedSong = await Song.findById(id);
            if (!requestedSong) {
                throw new Error('Unable to find a song with that id.');
            }
            res.json(requestedSong.songJacket);
        } catch (err) {
            res.status(500).send([{ param: 'song', msg: 'Unable to find a song with that ID.'}]);
        }
    }
    
    static async song_detail(req, res) {
        try {
            let id = req.params.id;
            const requestedSong = await Song.findById(id).populate('score').populate({path: 'scoreHistory', model: 'Score'});
            if (!requestedSong) {
                throw new Error('Unable to find a song with that id.');
            }
            res.json(requestedSong);
        } catch (err) {
            res.status(500).send([{ param: 'song', msg: 'Unable to find a song with that ID.'}]);
        }
    }

    static song_update_post = [
        body('title').trim().escape().isLength({ min: 1 }).withMessage("Song title is required."),
        body('artist').trim().escape().isLength({ min: 1 }).withMessage("Song artist is required."),
        body('difficulty').trim().escape().isInt({ min: 1, max: 20 }).withMessage("Song difficulty is outside the valid range.").toInt(),
        body('chartDifficulty').trim().escape().isLength({ min: 1 }).isIn(["Beginner", "Basic", "Difficult", "Expert", "Challenge"]).withMessage("Chart difficulty is invalid."),
        body('difficultyRank').trim().escape().isInt({ min: 0 }).withMessage('Difficulty rank is invalid').toInt(),
        body('chartMode').trim().escape().isLength({ min: 1 }).isIn(["Single", "Double"]).withMessage("Chart mode is invalid."),
        body('appearance').trim().escape().isLength({ min: 1 }).isIn(['1st Mix', '2nd Mix', '3rd Mix', '4th Mix', '5th Mix', 'MAX', 'MAX2', 'EXTREME', 'SuperNOVA', 'SuperNOVA2', 'DDR X', 'DDR X2', 'DDR X3', 'DDR 2013', 'DDR 2014', 'DDR A', 'DDR A20', 'DDR A20 PLUS', 'Other']).withMessage("Song's appearance is invalid."),
        check('songJacket').custom((value, {req}) => {
            try {
                const utf8 = Buffer.from(value, 'utf8');
                return !(/[^\x00-\x7f]/.test(utf8));
            } catch (e) {
                throw new Error("Song jacket is not in the right format.")
            }
        }),
        async (req, res, next) => {
            if (!res.locals.isAuthed) {
                res.status(500).send([{ param: 'credentials', msg: 'Incorrect user credentials. Please log in.' }]);
                return;
            }
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(500).send(errors.array());
                return;
            }
            const songJacketBuf = Buffer.from(req.body.songJacket, 'base64');
            const data = {
                title: req.body.title,
                artist: req.body.artist,
                difficulty: req.body.difficulty,
                chartDifficulty: req.body.chartDifficulty,
                difficultyRank: req.body.difficultyRank,
                chartMode: req.body.chartMode,
                appearance: req.body.appearance,
                songJacket: songJacketBuf,
            };
            const songID = req.params.id;
            try {
                const existingSong = await Song.findOne({  'title': req.body.title,
                                                            'artist': req.body.artist,
                                                            'chartDifficulty': req.body.chartDifficulty,
                                                            'chartMode': req.body.chartMode,
                                                            'appearance': req.body.appearance,
                                                            'songJacket': songJacketBuf})
                                                .exec();
                if (existingSong && existingSong._id !== songId) {
                    res.json({ status: 'failure', reason: 'duplicate', songID: existingSong._id });
                    return;
                }
                const updatedSong = await Song.findByIdAndUpdate(songID, data).exec();
                res.json({ status: 'success' });
            } catch (err) {
                res.status(500).send([{ param: 'song', msg: 'Unable to update song.' }]);
            }
        }
    ];

    static song_create_post = [
        body('title').trim().escape().isLength({ min: 1 }).withMessage("Song title is required."),
        body('artist').trim().escape().isLength({ min: 1 }).withMessage("Song artist is required."),
        body('difficulty').trim().escape().isInt({ min: 1, max: 20 }).withMessage("Song difficulty is outside the valid range.").toInt(),
        body('chartDifficulty').trim().escape().isLength({ min: 1 }).isIn(["Beginner", "Basic", "Difficult", "Expert", "Challenge"]).withMessage("Chart difficulty is invalid."),
        body('difficultyRank').trim().escape().isInt({ min: 0 }).withMessage('Difficulty rank is invalid').toInt(),
        body('chartMode').trim().escape().isLength({ min: 1 }).isIn(["Single", "Double"]).withMessage("Chart mode is invalid."),
        body('appearance').trim().escape().isLength({ min: 1 }).isIn(['1st Mix', '2nd Mix', '3rd Mix', '4th Mix', '5th Mix', 'MAX', 'MAX2', 'EXTREME', 'SuperNOVA', 'SuperNOVA2', 'DDR X', 'DDR X2', 'DDR X3', 'DDR 2013', 'DDR 2014', 'DDR A', 'DDR A20', 'DDR A20 PLUS', 'Other']).withMessage("Song's appearance is invalid."),
        body('maxCombo').trim().escape().isInt({ min: 1 }).withMessage("Max combo is invalid.").toInt(),
        body('freezeArrowCount').trim().escape().isInt({ min: 0 }).withMessage('Freeze arrow count is invalid.').toInt(),
        body('shockArrowCount').trim().escape().isInt({ min: 0 }).withMessage('Shock arrow count is invalid.').toInt(),
        body('freezeAndShockArrowCount').trim().escape().isInt({ min: 0 }).withMessage("Freeze and Shock Arrow count is invalid.").toInt(),
        check('freezeAndShockArrowCount').custom((value, {req}) => {
            if (value > req.body.maxCombo) {
                throw new Error("Freeze and Shock Arrow count cannot be greater than the max combo.")
            }
            return true;
        }),
        check('songJacket').custom((value, {req}) => {
            try {
                const utf8 = Buffer.from(value, 'utf8');
                return !(/[^\x00-\x7f]/.test(utf8));
            } catch (e) {
                throw new Error("Song jacket is not in the right format.")
            }
        }),
        async (req, res, next) => {
            if (!res.locals.isAuthed) {
                res.status(500).send([{param: 'credentials', msg: 'Incorrect user credentials. Please log in.'}]);
                return;
            }
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(500).send(errors.array());
                return;
            }
            const stepScore = 1000000/(req.body.maxCombo - req.body.shockArrowCount + req.body.freezeAndShockArrowCount);
            const songJacketBuf = Buffer.from(req.body.songJacket, 'base64');
            var newSong = new Song({
                title: req.body.title,
                artist: req.body.artist,
                difficulty: req.body.difficulty,
                chartDifficulty: req.body.chartDifficulty,
                difficultyRank: req.body.difficultyRank,
                chartMode: req.body.chartMode,
                appearance: req.body.appearance,
                maxCombo: req.body.maxCombo,
                shockArrowCount: req.body.shockArrowCount,
                freezeArrowCount: req.body.freezeArrowCount,
                freezeAndShockArrowCount: req.body.freezeAndShockArrowCount,
                songJacket: songJacketBuf,
                stepScore,
            });
            try {
                const existingSong = await Song.findOne({  'title': req.body.title,
                                                            'artist': req.body.artist,
                                                            'chartDifficulty': req.body.chartDifficulty,
                                                            'chartMode': req.body.chartMode,
                                                            'appearance': req.body.appearance})
                                                .exec();
                if (existingSong) {
                    res.json({ status: 'failure', reason: 'duplicate', songID: existingSong._id });
                    return;
                }
                const savedSong = await newSong.save();
                res.json({ status: 'success', songID: newSong._id });
            } catch (err) {
                console.log(err);
                res.status(500).send([{ param: 'song', msg: 'Unable to create song.' }]);
            }
        }
    ];

    static async song_delete_post(req, res) {
        if (!res.locals.isAuthed) {
            res.status(500).send([{ param: 'credentials', msg: 'Incorrect user credentials. Please log in.'}]);
            return;
        }
        const songID = req.params.id;
        try {
            const song = await Song.findById(songID);
            const scoresToDelete = [...song.scoreHistory, song.score];
            for (let score of scoresToDelete) {
                const deletedScore = await Score.findByIdAndDelete(score);
            }
            const deletedSong = await Song.deleteOne({_id: song._id });
            res.json({ status: 'success' });
        } catch (err) {
            console.log(err);
            res.status(500).send([{ param: 'song', msg: 'Unable to delete song and/or scores.' }]);
        }
    }

}