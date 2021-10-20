import MiscScore from '../models/miscScore.js';
import { body, check, param, validationResult } from 'express-validator';

export default class MiscScoresController {

    static async misc_score_count(req, res) {
        try {
            const miscScoreCount = await MiscScore.countDocuments({});
            res.json(miscScoreCount);
        } catch (err) {
            res.status(500).send([{ param: 'miscscore', msg: 'Unable to count miscscores.' }]);
        }
    }

    static misc_scores_list = [
        param('page').trim().escape().isInt({min: 1}).withMessage("Incorrect page value."),
        async (req, res, next) => {
            const page = req.params.page;
            try {
                const miscScoreList = await MiscScore.find().skip((page-1)*10).limit(10);
                res.json(miscScoreList);
            } catch (err) {
                res.status(500).send([{ param: 'miscscore', msg: 'Unable to find miscscores.' }]);
            }
        }
    ]

    static misc_score_create_post = [
        body('caption').trim().escape().isLength({ min: 1 }).withMessage("Caption is required."),
        check('screenshot').custom((value, {req}) => {
            try {
                const utf8 = Buffer.from(value, 'utf8');
                return !(/[^\x00-\x7f]/.test(utf8));
            } catch (e) {
                throw new Error("Screenshot is not in the right format.")
            }
        }),
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
            const screenshotBuf = Buffer.from(req.body.screenshot, 'base64');
            var newMiscScore = new MiscScore({
                caption: req.body.caption,
                screenshot: screenshotBuf,
            });
            try {
                const savedScore = await newMiscScore.save();
                res.json({ status: 'success', miscScoreID: newMiscScore._id });
            } catch (err) {
                console.log(err);
                res.status(500).send([{ param: 'miscscore', msg: 'Unable to create miscscore.' }]);
            }
        }
    ];

    static async misc_score_delete_post(req, res) {
        if (!res.locals.isAuthed) {
            res.status(500).send([{ param: 'credentials', msg: 'Incorrect user credentials. Please log in.'}]);
            return;
        }
        const miscScoreID = req.params.id;
        try {
            const deletedScore = await MiscScore.findByIdAndDelete(miscScoreID);
            res.json({ status: 'success' });
        } catch (err) {
            res.status(500).send([{ param: 'miscscore', msg: 'Unable to delete miscscore.' }]);
        }
    }

}