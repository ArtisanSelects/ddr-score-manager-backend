import Score from '../models/score.js';
import Song from '../models/song.js';
import { body, validationResult } from 'express-validator';


export default class ScoresController {

    static async score_detail(req, res) {
        try {
            const id = req.params.id;
            const requestedScore = await Score.findById(id);
            res.json(requestedScore);
        } catch (err) {
            res.status(500).send([{ param: 'score', msg: 'Unable to find requested score.'}]);
        }
    }

    static score_create_post = [
        body('song').trim().escape().isMongoId().withMessage("Problem with song ID"),
        body('marvellous').trim().escape().isInt({ min: 0 }).withMessage("Problem with marvellous count").toInt(),
        body('perfect').trim().escape().isInt({ min: 0 }).withMessage("Problem with perfect count").toInt(),
        body('great').trim().escape().isInt({ min: 0 }).withMessage("Problem with great count").toInt(),
        body('good').trim().escape().isInt({ min: 0 }).withMessage("Problem with good count").toInt(),
        body('boo').trim().escape().isInt({ min: 0 }).withMessage("Problem with boo count").toInt(),
        body('miss').trim().escape().isInt({ min: 0 }).withMessage("Problem with miss count").toInt(),
        body('ok').trim().escape().isInt({ min: 0 }).withMessage("Problem with ok count").toInt(),
        body('combo').trim().escape().isInt({ min: 0 }).withMessage("Problem with combo count").toInt(),
        body('score').trim().escape().isInt({ min: 0, max: 1000000 }).withMessage("Problem with score").toInt(),
        body('grade').trim().escape().isLength({ min: 1 }).isIn(['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D']).withMessage("Problem with grade."),
        body('status').trim().escape().isLength({ min: 1 }).isIn(['MFC', 'PFC', 'GFC', 'GoFC', 'Cleared', 'Unplayed']).withMessage("Problem with status"),
        async (req, res, next) => {
            if (!res.locals.isAuthed) {
                res.status(500).send([{ param: 'credentials', msg: 'Incorrect user credentials. Please log in.'}]);
                return;
            }
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(500).send(errors.array());
                return;
            }
            const newScore = new Score({
                song: req.body.song,
                marvellous: req.body.marvellous,
                perfect: req.body.perfect,
                great: req.body.great,
                good: req.body.good,
                boo: req.body.boo,
                miss: req.body.miss,
                ok: req.body.ok,
                combo: req.body.combo,
                score: req.body.score,
                grade: req.body.grade,
                status: req.body.status,
            });
            try {
                const score = await newScore.save();
                const song = await Song.findById(req.body.song);
                if (song.score) {
                    const newScoreHistory = [...song.scoreHistory, song.score];
                    song.scoreHistory = newScoreHistory;
                }
                song.score = score;
                const savedSong = await song.save();
                res.json({ status: 'success' });
            }  catch (err) {
                res.status(500).send([{ param: 'score', msg: 'Unable to create score.' }]);
            }
        }
    ];

    static async score_delete_post(req, res) {
        if (!res.locals.isAuthed) {
            res.status(500).send([{ param: 'credentials', msg: 'Incorrect user credentials. Please log in.'}]);
            return;
        }
        const scoreID = req.params.id;
        try {
            const score = await Score.findById(scoreID);
            const song = await Song.findById(score.song);
            if (scoreID == song.score) {
                if (song.scoreHistory.length > 0) {
                   song.score = song.scoreHistory.pop();
                } else {
                    song.score = null;
                }
            } else {
                song.scoreHistory = song.scoreHistory.filter(item => {
                    return item != scoreID;
                });
            }
            const savedSong = await song.save();
            const deletedScore = await Score.findByIdAndDelete(scoreID);
            res.json({ status: 'success' });
        } catch (err) {
            console.log(err);
            res.status(500).send([{ param: 'score', msg: 'Unable to delete score.' }]);
        }       
    }

    static async scores_delete_post(req, res) {
        const songID = req.params.songID;
        try {
            const song = await Song.findById(songID);
            for (let score of [...song.scoreHistory, song.score]) {
                const deletedScore = await Score.findByIdAndDelete(score);
            }
            song.scoreHistory = [];
            song.score = null;
            const savedSong = await song.save();
            res.status(200).json({ status: 'success' });
        } catch (err) {
            console.log(err);
            res.status(500).send([{ param: 'score', msg: 'Error deleting score(s).' }]);
        }
    }

}