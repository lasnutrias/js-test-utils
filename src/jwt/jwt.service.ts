import { generateKeyPairSync } from 'node:crypto';
import { TestArtifact } from '../common';
import { JWK, pem2jwk } from 'pem-jwk';
import * as jwt from 'jsonwebtoken';
import express from 'express';
import { Server } from 'node:http';

type JwkExtras = {
  kid: string;
  use: string;
  alg: 'RS256';
};

export class JwtService implements TestArtifact {
  private _privateKeyPem: string;
  private _jwk: JWK<JwkExtras>;
  jwt_issuer: string;
  jwt_audience: string;
  jwt_jwks_url: string;
  private app: express.Application;
  private server: Server | null = null;

  get privateKeyPem(): string {
    return this._privateKeyPem;
  }

  get jwk(): JWK<JwkExtras> {
    return this._jwk;
  }

  jwt_sign(payload: object = {}): string {
    const options: jwt.SignOptions = {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: this.jwt_issuer,
      audience: this.jwt_audience,
      keyid: '1',
    };
    return jwt.sign(payload, this.privateKeyPem, options);
  }

  private initKeys() {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    const [publicKeyPem, privateKeyPem] = [publicKey, privateKey].map(
      (k) =>
        k.export({
          type: 'pkcs1',
          format: 'pem',
        }) as string,
    );
    this._privateKeyPem = privateKeyPem;
    this._jwk = pem2jwk<JwkExtras>(publicKeyPem, {
      kid: '1',
      use: 'sig',
      alg: 'RS256',
    });
  }

  // MÉTODO 1: Iniciar el servidor
  private async startServer(): Promise<void> {
    this.app = express();
    this.app.get('/.well-known/jwks.json', (req, res) => {
      res.json({ keys: [this._jwk] });
    });
    return new Promise((resolve) => {
      const port = 3010;
      this.server = this.app.listen(port, () => {
        const listen = `http://localhost:${port}`;
        this.jwt_audience = listen;
        this.jwt_issuer = `${listen}/`;
        this.jwt_jwks_url = `${listen}/.well-known/jwks.json`;
        console.log(`🚀 JWKS Mock Server running at ${listen}`);
        resolve();
      });
    });
  }

  // MÉTODO 2: Detener el servidor
  private async stopServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) return reject(err);
          console.log('🛑 JWKS Mock Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async startup(): Promise<boolean> {
    this.initKeys();
    await this.startServer();
    return true;
  }

  async shutdown(): Promise<boolean> {
    await this.stopServer();
    return true;
  }
}
