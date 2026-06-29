import bcrypt from 'bcryptjs';

export class PasswordService {
  private static readonly ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
