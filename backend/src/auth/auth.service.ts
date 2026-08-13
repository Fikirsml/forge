import {ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {PrismaService} from '../prisma/prisma.service'
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
constructor(private readonly prisma:PrismaService){}

async signup(dto:SignupDto){
    const existing = await this.prisma.user.findUnique({
        where:{
            email:dto.email
        },
    })

    if (existing) {
        throw new ConflictException('Email Already Exists')
    }

    const passwordHash= await bcrypt.hash(dto.password,10)

    const user = await this.prisma.user.create({
        data:{
            email: dto.email,
            passwordHash,
        }
    })

    const {passwordHash:_,...safeUser}=user 
    return safeUser 
}


}
