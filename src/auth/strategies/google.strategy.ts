import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID:  process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
      passReqToCallback: false,
      session: false,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const email = profile?.emails?.[0]?.value;
    const name =
      profile?.displayName ??
      [profile?.name?.givenName, profile?.name?.familyName]
        .filter(Boolean)
        .join(' ');

    const googleSub = profile?.id;

    try {
      const user = await this.authService.findOrCreateOAuthUser({
        provider: 'google',
        providerId: googleSub,
        email,
        name,
      });
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
}


