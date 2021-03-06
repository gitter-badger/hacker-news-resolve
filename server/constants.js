import path from 'path'

export const authenticationSecret = 'auth-secret'
export const cookieName = 'authenticationToken'
export const cookieMaxAge = 1000 * 60 * 60 * 24 * 365
export const databaseFilePath = path.join(__dirname, '../storage.json')
