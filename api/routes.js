import express from "express";
import ScoresController from "../controllers/scoresController.js";
import SongsController from "../controllers/songsController.js";
import MiscScoresController from "../controllers/miscScoresController.js";
import UserAuthController from "../controllers/userAuthController.js";

const router = express.Router();

//score routes
router.get('/scores/:id', ScoresController.score_detail);

router.post('/scores/:songID/create', ScoresController.score_create_post);

router.post('/songs/:songID/deleteScores', ScoresController.scores_delete_post);

router.post('/scores/:id/delete', ScoresController.score_delete_post);

//songs routes
router.get('/songs', SongsController.song_list);

router.get('/songs/:id', SongsController.song_detail);

router.get('/songs/jacket/:id', SongsController.song_jacket_get);

router.post('/songs/create', SongsController.song_create_post);

router.post('/songs/:id/update', SongsController.song_update_post);

router.post('/songs/:id/delete', SongsController.song_delete_post);

//misc scores routes
router.get('/miscscores/get/:page', MiscScoresController.misc_scores_list);

router.get('/miscscores/count', MiscScoresController.misc_score_count);

router.post('/miscscores/create', MiscScoresController.misc_score_create_post);

router.post('/miscscores/:id/delete', MiscScoresController.misc_score_delete_post);

//user authentication routes
router.post('/login', UserAuthController.login_post);

router.post('/signup', UserAuthController.signup_post);

router.post('/logout', UserAuthController.logout_post);

router.get('/checkauth', UserAuthController.check_auth);

export default router;