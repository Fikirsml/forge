import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy, { provide: PrismaService, useValue: prisma }],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should return a user if the check is successful', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'uuid1',
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      createdAt: new Date(),
    });

    const result = await strategy.validate({
      sub: 'uuid1',
      email: 'test@example.com',
    });
    expect(result).not.toHaveProperty('passwordHash');
    expect(result.email).toBe('test@example.com');
  });

  it('Throws error if the user doesnt exsit', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'deleted-user-id', email: 'wrong@email.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
