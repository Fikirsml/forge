import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {PrismaService} from '../src/prisma/prisma.service'


describe('Auth (e2e)',()=>{

    let app:INestApplication;
    let prisma:PrismaService;
    let testEmail='test@example.com';


    beforeAll(async()=>{
        const moduleFixture:TestingModule=await Test.createTestingModule({
            imports:[AppModule]
        }).compile()
        app=moduleFixture.createNestApplication();
        app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init()

    prisma=moduleFixture.get<PrismaService>(PrismaService)
    })

    afterEach(async()=>{
        await prisma.user.deleteMany({where:{email:testEmail}})
    })

    afterAll(async()=>{
        await app.close()
    })


 it('/auth/signup (POST) creates a user and never returns passwordHash', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: 'password123' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(testEmail);
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('/auth/signup (POST) rejects an invalid email with 400', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'not-an-email', password: 'password123' })
      .expect(400);
  });

  it('/auth/signup (POST) returns 409 on duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: 'password123' })
      .expect(201);

    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: 'password123' })
      .expect(409);
  });

    

})