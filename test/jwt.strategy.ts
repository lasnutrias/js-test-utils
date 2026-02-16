import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Extrae el token del header 'Authorization: Bearer <TOKEN>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: config.get<string>('AUTH0_AUDIENCE'), // El identificador de tu API en Auth0
      issuer: config.get<string>('AUTH0_ISSUER'), // Tu dominio de Auth0 con el slash final
      algorithms: ['RS256'],
      // Configuración para obtener la llave pública dinámicamente
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.get<string>('AUTH0_JWKS_URL', ''),
      }),
    });
  }

  // Este método se ejecuta si el token es válido
  validate(payload: any): any {
    // El payload contiene la información del usuario (sub, email, etc.)
    return payload;
  }
}
