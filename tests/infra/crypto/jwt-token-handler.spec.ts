import jwt from 'jsonwebtoken'
import { JwtTokenHandler } from '@/infra/crypto'

jest.mock('jsonwebtoken')

describe('JwtTokenHandler', () => {
    let sut: JwtTokenHandler
    let fakeJwt: jest.Mocked<typeof jwt>
    let secret: string

    beforeAll(() => {
        secret = 'any_secret'
        fakeJwt = jwt as jest.Mocked<typeof jwt>
    })

    beforeEach(() => {
        sut = new JwtTokenHandler(secret)
    })

    describe('generateToken', () => {
        let key: string
        let expirationInMs: number
        let token: string

        beforeAll(() => {
            key = 'any_key'
            token = 'any_token'
            expirationInMs = 1000
            fakeJwt.sign.mockImplementation(() => token)
        })

        it('should call sign with correct input', async () => {
            await sut.generateToken({ key, expirationInMs })

            expect(fakeJwt.sign).toHaveBeenCalledWith({ key }, secret, {
                expiresIn: 1,
            })
            expect(fakeJwt.sign).toHaveBeenCalledTimes(1)
        })

        it('should return a token', async () => {
            const generatedToken = await sut.generateToken({
                key,
                expirationInMs,
            })

            expect(generatedToken).toBe(token)
        })

        it('should rethrow if sign throws', async () => {
            fakeJwt.sign.mockImplementationOnce(() => {
                throw new Error('token_error')
            })

            const output = sut.generateToken({
                key,
                expirationInMs,
            })

            await expect(output).rejects.toThrow(new Error('token_error'))
        })
    })

    describe('validateToken', () => {
        let token: string
        let key: string

        beforeAll(() => {
            token = 'any_token'
            key = 'any_key'
            fakeJwt.verify.mockImplementation(() => ({ key }))
        })

        it('should call sign with correct input', async () => {
            await sut.validateToken({ token })

            expect(fakeJwt.verify).toHaveBeenCalledWith(token, secret)
            expect(fakeJwt.verify).toHaveBeenCalledTimes(1)
        })

        it('should return the key used to sign', async () => {
            const generatedKey = await sut.validateToken({ token })

            expect(generatedKey).toBe(key)
        })

        it('should rethrow if verify throws', async () => {
            fakeJwt.verify.mockImplementationOnce(() => {
                throw new Error('key_error')
            })

            const output = sut.validateToken({ token })

            await expect(output).rejects.toThrow(new Error('key_error'))
        })

        it('should throw if verify returns null', async () => {
            fakeJwt.verify.mockImplementationOnce(() => null)

            const promise = sut.validateToken({ token })

            await expect(promise).rejects.toThrow()
        })
    })
})
