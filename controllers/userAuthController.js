import User from '../models/user.js';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.SECRET;
const jwtExpirationSec = 3 * 24 * 60 * 60;
const jwtExpirationMS = jwtExpirationSec * 1000;

function createJWT(id) {
    return jwt.sign(
        { id }, 
        secret,
        { expiresIn: jwtExpirationSec }
    );
}

export default class UserAuthController {

    static login_post = [
        body('username').trim().escape().isLength({ min: 1, max: 24 }).withMessage('Username is required.'),
        body('password').trim().escape().isLength({ min: 8 }).withMessage('Password is required and must be 8 or more characters in length.'),
        async (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(500).send(errors.array());
                return;
            } else {
                const { username, password } = req.body;
                try {
                    const user = await User.login(username, password);
                    const token = createJWT(user._id);
                    res.cookie('jwt', token, { domain: "https://ddr-score-manager.netlify.app/", httpOnly: true, maxAge: jwtExpirationMS });
                    res.status(200).json({ user: user._id });
                } catch (e) {
                    res.status(400).send([{msg: e.message}]);
                }
            }
        }
    ];

    static signup_post = [
        body('username').trim().escape().isLength({ min: 1, max: 24 }).withMessage('Username is required and must be under 24 characters in length.'),
        body('password').trim().escape().isLength({ min: 8 }).withMessage('Password must be 8 or more characters in length.'),
        body('username').custom(async (value, {req}) => {
            try {
                const exisitingUser = await User.findOne({ 'username': value });
                if (exisitingUser) {
                    throw new Error("This username is already in use.");
                }
            } catch (e) {
                throw new Error(e.message);
            }
        }),
        async (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(500).send(errors.array());
                return;
            } else {
                try {
                    const user = await User.create({ username: req.body.username, password: req.body.password });
                    const token = createJWT(user._id);
                    res.cookie('jwt', token, { domain: "https://ddr-score-manager.netlify.app/", httpOnly: true, maxAge: jwtExpirationMS });
                    res.status(201).json({ user: user._id });
                }
                catch (err) {
                    res.status(400).send([{msg: 'Unable to create account. Please try again later.'}]);
                }
            }
        }
    ];

    static async logout_post(req, res) {
        res.cookie('jwt', '', { domain: "https://ddr-score-manager.netlify.app/", maxAge: 1 });
        res.status(200).json({ status: 'success' });
    }

    static check_auth(req, res) {
        res.json({ isAuthed: res.locals.isAuthed });
    }

}