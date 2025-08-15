import crypto from 'crypto';

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

export async function comparePassword(password, hash) {
  const [salt, key] = hash.split(':');
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, Buffer.from(salt, 'hex'), KEY_LENGTH, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
  return key === derivedKey.toString('hex');
}