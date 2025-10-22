import bcrypt from 'bcryptjs';

type HashTarget = 'password' | 'secret' | 'token';

const DEFAULT_ROUNDS = 12;

const roundsByTarget: Record<HashTarget, number> = {
  password: DEFAULT_ROUNDS,
  secret: DEFAULT_ROUNDS,
  token: 10
};

const getRounds = (target: HashTarget) => roundsByTarget[target] ?? DEFAULT_ROUNDS;

const hash = async (value: string, target: HashTarget) => bcrypt.hash(value, getRounds(target));

export const hashingService = {
  async hashPassword(password: string) {
    return hash(password, 'password');
  },
  async hashSecret(secret: string) {
    return hash(secret, 'secret');
  },
  async hashToken(token: string) {
    return hash(token, 'token');
  },
  async comparePassword(password: string, hashValue: string) {
    return bcrypt.compare(password, hashValue);
  },
  async compareSecret(value: string, hashValue: string) {
    return bcrypt.compare(value, hashValue);
  }
};

export type HashingService = typeof hashingService;
