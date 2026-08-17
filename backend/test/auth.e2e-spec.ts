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


  describe('login (e2e)',()=>{

const loginEmail='e2e-login-test@example.com'
const loginPassword='password123'

beforeAll(async()=>{
   await request(app.getHttpServer())
   .post('/auth/signup')
   .send({email:loginEmail,password:loginPassword})
})

afterAll(async()=>{
  await prisma.user.deleteMany({where:{email:loginEmail}})
})

it('/auth/login (POST) returns an access token for valid credentials', async()=>{
  const response = await request(app.getHttpServer())
  .post('/auth/login')
  .send({email:loginEmail, password:loginPassword})
  .expect(201)

  expect(response.body).toHaveProperty('accessToken')

  const parts=response.body.accessToken.split('.')
  expect(parts.length).toBe(3)
})

it('/auth/login (POST) returns 401 for a wrong password', async()=>{
  const response= await request(app.getHttpServer())
  .post('/auth/login')
  .send({email:loginEmail,password:'wrongPassword'})
  .expect(401)
})

it('/auth/login (POST) returns 401 for a nonexistent email',async()=>{
  const response=await request(app.getHttpServer())
  .post('/auth/login')
  .send({email:'wrong-email@gmail.com',password:loginPassword})
  .expect(401)

})


})
    

})

