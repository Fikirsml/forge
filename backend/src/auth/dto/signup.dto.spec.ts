import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { SignupDto } from "./signup.dto";

describe('SignupDto',()=>{
    it('passes validation with valid email and password', async()=>{
        const dto=plainToInstance(SignupDto,{
            email:'test@example.com',
            password:'Password123'

        })

        const errors=await validate(dto)
        expect(errors.length).toBe(0)
    })

    it('fails validation with invalid email',async()=>{
        const dto=plainToInstance(SignupDto,{
            email:'invalid-email',
            password:'Password123'
        })
        const errors=await validate(dto)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors[0].property).toBe('email')
    })

    it('fails validation with invalid password',async()=>{
        const dto=plainToInstance(SignupDto,{
            email:'valid@email.com',
            password:'short'
        })
        const errors=await validate(dto)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors[0].property).toBe('password')
    })


}) 