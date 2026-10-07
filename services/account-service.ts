import { UsersRepository } from '../models/users.repo';
import { QuotaService } from './quota-service';
import { UserSession } from '../lib/session';

export class AccountService {
  static async getAccountDetails(session: UserSession) {
    const storeCode = await UsersRepository.getStoreCodeSetting(session.userId);
    const usage = await QuotaService.getUserUsage(session.userId);

    return {
      user: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        provider: session.user.provider,
      },
      settings: {
        storeCode,
      },
      usage,
    };
  }

  static async updateSettings(userId: string, storeCode: boolean) {
    await UsersRepository.updateStoreCode(userId, storeCode);
    return { storeCode };
  }

  static async deleteAccount(userId: string) {
    await UsersRepository.deleteAccountCascade(userId);
    return { deleted: true };
  }
}
