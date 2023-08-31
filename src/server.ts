import express from 'express';
import { bearerToken } from 'express-bearer-token';
import pkg from '@json-spec/core';
import ReadAPIConfig from './loader/config';
import AccountManager, { NewUserInformation } from './Account';
import AccessTokenManager from './AccessTokenManager';
import ScoreManager from './ScoreManager';
import { createAccountSpec } from './specs/account/create';
import { signinSpec } from './specs/account/signin';
import { newRecordSpec } from './specs/record/new';
import { updateAccountSpec } from './specs/account/update';
import { writeFileSync } from 'fs';
import { changePasswordSpec } from './specs/account/changePassword';
const { isValid } = pkg;
const Config = ReadAPIConfig('./api.config');
const AccountMgr: AccountManager = new AccountManager(Config.account_manager.password_len);
const AccessToken: AccessTokenManager = new AccessTokenManager(Config.access_token.length);
const ScoreMgr: ScoreManager = new ScoreManager(Config.scoredata);

export default function CreateAPIServer(): express.Express {
    const app = express();
    app.use(bearerToken());
    app.post('/api/account', express.json(), async (req, res) => {
        if (req.token == null) return res.sendStatus(401);
        const SystemID = AccessToken.getId(req.token);
        if (SystemID == null) return res.sendStatus(401);
        await AccountMgr.GetAccountInfo(SystemID)
            .then(data => data.privilege === 0)
            .then(allowed => {
                if (!allowed) return res.sendStatus(403);
                if (!isValid(createAccountSpec, req.body)) return res.sendStatus(400);
                return AccountMgr.AddNewAccount(req.body.id, req.body.name, req.body.privilege)
                    .then(result => res.status(201).send(JSON.stringify(result)))
                    .catch(er => {
                        console.log(er.message);
                        return res.sendStatus(500);
                    });
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
    app.patch('/api/account', express.json(), async (req, res) => {
        if (req.token == null) return res.sendStatus(401);
        const SystemID = AccessToken.getId(req.token);
        if (SystemID == null) return res.sendStatus(401);
        if (!isValid(updateAccountSpec, req.body)) return res.sendStatus(400);
        await AccountMgr.ChangeUserInfo(SystemID, req.body as NewUserInformation).then(newRecord => {
            return newRecord == null ? res.sendStatus(400) : res.status(200).json(newRecord);
        });
    });
    app.delete('/api/account', async (req, res) => {
        if (req.token == null) return res.sendStatus(401);
        const SystemID = AccessToken.getId(req.token);
        if (SystemID == null) return res.sendStatus(401);
        await AccountMgr.DeleteUser(SystemID)
            .then(result => {
                res.sendStatus(result.ID === SystemID ? 200 : 500);
                if (result.ID !== result.ID) {
                    const WriteData = result;
                    WriteData['delete_target'] = SystemID;
                    writeFileSync(`./error-${Date.now.toString()}.data`, JSON.stringify(WriteData));
                }
            })
            .catch((er: Error) => {
                res.status(500).send(er.message);
            });
    });
    app.patch('/api/account/password', express.json(), async (req, res) => {
        if (req.token == null) return res.sendStatus(401);
        const SystemID = AccessToken.getId(req.token);
        if (SystemID == null) return res.sendStatus(401);
        if (!isValid(changePasswordSpec, req.body)) return res.sendStatus(400);
        await AccountMgr.GetAccountInfo(SystemID).then(data => {
            return AccountMgr.GetSystemID(req.body.id)
                .then(id => {
                    if (SystemID === id || data.privilege === 0)
                        return AccountMgr.ChangePassword(id, req.body.password).then(result => (result ? 200 : 500));
                    else return 403;
                })
                .then(statusCode => res.sendStatus(statusCode));
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
        if (req.token == null) return res.sendStatus(401);
        const SystemID = AccessToken.getId(req.token);
        if (SystemID == null) return res.sendStatus(401);
        if (!isValid(newRecordSpec, req.body)) return res.sendStatus(400);
        ScoreMgr.add(req.body);
        res.sendStatus(200);
    });
    app.get('/api/record', async (req, res) => {
        if (req.token == null) return res.sendStatus(401);
        const SystemID = AccessToken.getId(req.token);
        if (SystemID == null) return res.sendStatus(401);
        res.status(200).json(ScoreMgr.read());
    });
    app.delete('/api/record/:record_id', async (req, res) => {
        if (req.token == null) return res.sendStatus(401);
        const SystemID = AccessToken.getId(req.token);
        if (SystemID == null) return res.sendStatus(401);
        ScoreMgr.remove(req.params.record_id);
        res.sendStatus(200);
    });
    return app;
}
