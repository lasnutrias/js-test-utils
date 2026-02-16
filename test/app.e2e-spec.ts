import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './app.module';
import { JwtService, MongodbService } from '../src';
import { randomUUID } from 'node:crypto';
import { ConfigModule } from '@nestjs/config';
import { AppDocument } from './app.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const jwtService = new JwtService();
  const dbService = new MongodbService('test');

  beforeAll(async () => {
    await Promise.all([jwtService, dbService].map((s) => s.startup()));
  });

  afterAll(async () => {
    await Promise.all([jwtService, dbService].map((s) => s.shutdown()));
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          ignoreEnvFile: true,
          isGlobal: true,
          load: [
            () => ({
              AUTH0_JWKS_URL: jwtService.jwt_jwks_url,
              AUTH0_ISSUER: jwtService.jwt_issuer,
              AUTH0_AUDIENCE: jwtService.jwt_audience,
            }),
          ],
        }),
        MongooseModule.forRoot(dbService.uri, {
          dbName: 'test',
          connectionName: 'test',
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('TOKEN TEST', () => {
    it('/unsafe (GET)', () => {
      return request(app.getHttpServer())
        .get('/unsafe')
        .expect(200)
        .expect('unsafe');
    });

    it('/safe (GET) 401', () => {
      return request(app.getHttpServer()).get('/safe').expect(401);
    });

    it('/safe (GET) 200', () => {
      const token = jwtService.jwt_sign({
        sub: 'google-oauth2|1234567891234657',
        scope: 'openid profile email',
        org_id: 'org_1234567891234657',
        client_id: '12345678912346571234567891234657',
        jti: randomUUID(),
      });
      console.log(token);
      return request(app.getHttpServer())
        .get('/safe')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('safe');
    });
  });
  describe('DBTEST', () => {
    it("/app (post) {'name':'someapp'} 200", () => {
      const token = jwtService.jwt_sign({
        sub: 'google-oauth2|1234567891234657',
        scope: 'openid profile email',
        org_id: 'org_1234567891234657',
        client_id: '12345678912346571234567891234657',
        jti: randomUUID(),
      });
      return request(app.getHttpServer())
        .post('/app')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'someapp' })
        .expect(201)
        .expect((res) => {
          expect(res).toBeDefined();
          const app = res.body as AppDocument;
          expect(app._id).toBeDefined();
        });
    });
  });
});
