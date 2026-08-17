import {ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {PrismaService} from '../prisma/prisma.service'
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
constructor(private readonly prisma:PrismaService,private readonly jwtService: JwtService,){}

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


async login(dto:LoginDto){
    const user= await this.prisma.user.findUnique({
        where:{
            email: dto.email
        }
    })
    if (!user){
        throw new UnauthorizedException('Invalid Credentials')
    }


    const passworMatches=await bcrypt.compare(dto.password,user.passwordHash)

    if(!passworMatches){
        throw new UnauthorizedException('Invalid Credentials')
    }

    const payload={
        sub:user.id,
        email: user.email
    }
    const accessToken=await this.jwtService.signAsync(payload)

    return {accessToken}
}


}
