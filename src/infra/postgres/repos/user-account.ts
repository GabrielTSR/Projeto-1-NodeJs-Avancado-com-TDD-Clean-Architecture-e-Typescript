import { getRepository } from 'typeorm'
import { LoadUserAccountRepository, SaveFacebookAccountRepository } from '@/data/contracts/repos'
import { PgUser } from '@/infra/postgres/entities/user'

export class PgUserAccountRepository implements LoadUserAccountRepository {
    async load(params: LoadUserAccountRepository.Params): Promise<LoadUserAccountRepository.Result> {
        const pgUserRepo = getRepository(PgUser)
        const pgUser = await pgUserRepo.findOne({ email: params.email })
        if (pgUser) {
            return {
                id: pgUser.id?.toString(),
                name: pgUser?.name ?? undefined,
            }
        }
        return undefined
    }

    async saveWithFacebook(params: SaveFacebookAccountRepository.Params): Promise<void> {
        const pgUserRepo = getRepository(PgUser)
        if (!params?.id) {
            await pgUserRepo.save({
                email: params.email,
                name: params.name,
                facebookId: params.facebookId,
            })
        } else {
            await pgUserRepo.save({
                id: Number(params.id),
                name: params.name,
                facebookId: params.facebookId,
            })
        }
    }
}