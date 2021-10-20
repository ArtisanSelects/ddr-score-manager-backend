import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.SECRET;

export default function requireAuth(req, res, next) {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, secret, (err, decodedToken) => {
            if (err) 
            {
                console.log('error in requireAuth/jwt.verify');
                res.locals.isAuthed = false;
            }
            res.locals.isAuthed = true;
        });
    } else {
        res.locals.isAuthed = false;
    }
    next();
}