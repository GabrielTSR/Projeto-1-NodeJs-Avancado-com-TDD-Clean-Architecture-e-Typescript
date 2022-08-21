import { mock, MockProxy } from 'jest-mock-extended'
import { UnauthorizaredError } from '@/application/errors/http'
import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'
import { AccessToken } from '@/domain/models'
import { FacebookLoginController } from '@/application/controllers'
import { ServerError } from '@/application/errors'

jest.mock('@/application/validation/required-string')

describe('FacebookLoginController', () => {
    let sut: FacebookLoginController
    let facebookAuth: MockProxy<FacebookAuthentication>
    let token: string

    beforeAll(() => {
        token = 'any_token'
        facebookAuth = mock<FacebookAuthentication>()
        facebookAuth.perform.mockResolvedValue(new AccessToken('any_value'))
    })

    beforeEach(() => {
        sut = new FacebookLoginController(facebookAuth)
    })

    // it('should return 400 if validation fails', async () => {
    //     const error = new Error('validation_error')
    //     const RequiredStringValidatorSpy = jest.spyOn(
    //         RequiredStringValidator.prototype,
    //         'validate'
    //     )
    //     RequiredStringValidatorSpy.mockImplementation(() => error)
    //     const httpResponse = await sut.handle({ token })

    //     expect(RequiredStringValidator).toHaveBeenCalledWith(
    //         'any_token',
    //         'token'
    //     )
    //     expect(httpResponse).toEqual({
    //         statusCode: 400,
    //         data: error,
    //     })
    // })

    it('should call FacebookAuthentication with correct params', async () => {
        await sut.handle({ token })

        expect(facebookAuth.perform).toHaveBeenCalledWith({
            token,
        })
        expect(facebookAuth.perform).toHaveBeenCalledTimes(1)
    })

    it('should return 401 if token is authentication fails', async () => {
        facebookAuth.perform.mockResolvedValueOnce(new AuthenticationError())
        const httpResponse = await sut.handle({ token })

        expect(httpResponse).toEqual({
            statusCode: 401,
            data: new UnauthorizaredError(),
        })
    })

    it('should return 200 if token is authentication succeeds', async () => {
        const httpResponse = await sut.handle({ token })

        expect(httpResponse).toEqual({
            statusCode: 200,
            data: {
                accessToken: new AccessToken('any_value').value,
            },
        })
    })

    it('should return 500 if authentication throws', async () => {
        const error = new Error('infra_error')
        facebookAuth.perform.mockRejectedValueOnce(error)
        const httpResponse = await sut.handle({ token })

        expect(httpResponse).toEqual({
            statusCode: 500,
            data: new ServerError(error),
        })
    })
})
