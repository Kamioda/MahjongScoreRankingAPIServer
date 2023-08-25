import express from 'express';
import { bearerToken } from 'express-bearer-token';
import pkg from '@json-spec/core';
import { createAccountSpec } from './specs/account/create';
import AccountManager from './Account';
import ScoreManager from './ScoreManager';
import { signinSpec } from './specs/account/signin';
import { newRecordSpec } from './specs/record/new';
import ReadAPIConfig from './loader/config';
import AccessTokenManager from './AccessTokenManager';
const { isValid } = pkg;
const Config = ReadAPIConfig('./api.config');
const AccountMgr: AccountManager = new AccountManager(Config.account_manager.password_len);
const AccessToken: AccessTokenManager = new AccessTokenManager(Config.access_token.length);
const ScoreMgr: ScoreManager = new ScoreManager(Config.scoredata);

export default function CreateAPIServer(): express.Express {
    const app = express();
    app.use(bearerToken());
    app.post('/api/account', express.json(), async (req, res) => {
        if (!isValid(createAccountSpec, req.body)) return res.sendStatus(400);
        await AccountMgr.AddNewAccount(req.body.id, req.body.name, req.body.privilege)
            .then(result => res.status(201).send(JSON.stringify(result)))
            .catch(er => {
                console.log(er.message);
            });
    });
    app.post('/api/signin', express.json(), async (req, res) => {
        if (!isValid(signinSpec, req.body)) return res.sendStatus(400);
        await AccountMgr.SignIn(req.body.id, req.body.password)
            .then(() => {
                res.sendStatus(200);
            })
            .catch(() => {
                res.sendStatus(401);
            });
    });
    app.post('/api/record', express.json(), async (req, res) => {
        if (!isValid(newRecordSpec, req.body)) return res.sendStatus(400);
        ScoreMgr.add(req.body);
        res.sendStatus(200);
    });
    return app;
}
