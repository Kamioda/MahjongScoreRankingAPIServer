import { readFileSync } from 'fs';

interface TokenConfig {
    length: number;
}

interface AccountManagerConfig {
    password_len: number;
}

interface ApiConfig {
    account_manager: AccountManagerConfig;
    access_token: TokenConfig;
    scoredata: string;
}

export default function ReadAPIConfig(ConfigFilePath: string): ApiConfig {
    return JSON.parse(readFileSync(ConfigFilePath, 'utf-8')) as ApiConfig;
}
