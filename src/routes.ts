import { Router } from 'express';
import AccountController from './controllers/AccountController';
import AuthController from './controllers/AuthController';
import MatchController from './controllers/MatchController';
import LeagueInfoController from './controllers/LeagueInfoController';

const router = Router();

router.route('/')
  .get((req, res) => res.json('Hello World'));

// auth routes
router.route('/login/')
  .post(AuthController.login);

router.route('/register/')
  .post(AuthController.register);

// account routes
router.route('/user/:username/accounts/')
  .get(AccountController.retrieve)
  .post(AccountController.register)
  .put(AccountController.update);

// league info routes
router.route('/user/:username/leagueInfo')
  .get(LeagueInfoController.retrieve)
  .put(LeagueInfoController.update);

// match routes
router.route('/user/:username/matches')
  .get(MatchController.listAll)
  .put(MatchController.update);

export default router;
