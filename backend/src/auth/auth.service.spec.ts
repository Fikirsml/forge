import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwtService:{signAsync: jest.Mock}
  const token="jwt-token"

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService={
      signAsync:jest.fn().mockResolvedValue(token)
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {provide: JwtService, useValue: jwtService}
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user and strips passwordHash from the result', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'some-uuid',
      email: 'test@example.com',
      passwordHash: 'hashed-value',
      createdAt: new Date(),
    });

    const result = await service.signup({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).not.toHaveProperty('passwordHash');
    expect(result.email).toBe('test@example.com');
  });

  it('throws ConflictException when the email already exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

    await expect(
      service.signup({ email: 'test@example.com', password: 'password123' }),
    ).rejects.toThrow(ConflictException);
  });



  describe('login',()=>{
      it('returns an access token for a valid credential', async()=>{
        const hash=await bcrypt.hash('password123',10)
        prisma.user.findUnique.mockResolvedValue({
            id:'some-uuid',
            email: 'test@example.com',
            passwordHash:hash,
        })

        const result=await service.login({
          email:'test@example.com',
          password:'password123',
        })

        expect(result).toEqual({accessToken:token})
        expect(jwtService.signAsync).toHaveBeenCalledWith({sub:'some-uuid',email:'test@example.com'})

      })



      it('throws error for invalid or non existent email',async()=>{
        prisma.user.findUnique.mockResolvedValue(null)
        await expect(
          service.login({email:'somethingrando',password:'password123'}),
        ).rejects.toThrow(UnauthorizedException)
      })

       it('throws UnauthorizedException for a wrong password', async () => {
      const hash = await bcrypt.hash('password123', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'some-uuid',
        email: 'test@example.com',
        passwordHash: hash,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  })

});