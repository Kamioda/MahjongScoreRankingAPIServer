import express from 'express';
import { bearerToken } from 'express-bearer-token';
import pkg from '@json-spec/core';
import ReadAPIConfig from './loader/config';
import AccountManager from './Account';
import AccessTokenManager from './AccessTokenManager';
import ScoreManager from './ScoreManager';
import { createAccountSpec } from './specs/account/create';
import { signinSpec } from './specs/account/signin';
import { newRecordSpec } from './specs/record/new';
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
    app.get('/api/account', async (req, res) => {
        if (req.token == null) return res.sendStatus(401);
        const SystemID = AccessToken.getId(req.token);
        if (SystemID == null) return res.sendStatus(401);
        await AccountMgr.GetAccountInfo(SystemID)
            .then(result => {
                res.status(200).json(result);
            })
            .catch((er: Error) => {
                res.status(404).send(er.message);
            });
    });
    app.post('/api/signin', express.json(), async (req, res) => {
        if (!isValid(signinSpec, req.body)) return res.sendStatus(400);
        await AccountMgr.SignIn(req.body.id, req.body.password)
            .then(id => {
                const AccessTokenText = AccessToken.create(id);
                res.status(200).json({ token_type: 'bearer', access_token: AccessTokenText });
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
    app.get('/api/record', async (req, res) => {
        res.status(200).json(ScoreMgr.read());
    });
    app.delete('/api/record/:record_id', async (req, res) => {
        ScoreMgr.remove(req.params.record_id);
        res.sendStatus(200);
    });
    return app;
}
