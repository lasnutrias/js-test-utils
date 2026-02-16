import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './app.module';
import { JwtService } from '../src/jwt/jwt.service';
import { randomUUID } from 'node:crypto';
import { ConfigModule } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const jwtService = new JwtService();

  beforeAll(async () => {
    await jwtService.startup();
  });

  afterAll(async () => {
    await jwtService.shutdown();
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
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/unsafe (GET)', () => {
    return request(app.getHttpServer())
      .get('/unsafe')
      .expect(200)
      .expect('unsafe');
  });

  it('/ (GET) 401', () => {
    return request(app.getHttpServer()).get('/safe').expect(401);
  });

  it('/ (GET) 200', () => {
    const token = jwtService.jwt_sign({
      sub: 'google-oauth2|103909070939588622489',
      scope: 'openid profile email',
      org_id: 'org_sSs2nagLsL7VJOK0',
      client_id: 'k4mvkO7YaNpWUQNFhBXUsnVtsvElxGmD',
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
