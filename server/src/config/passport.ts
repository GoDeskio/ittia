import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
// import { Strategy as InstagramStrategy } from 'passport-instagram';
import { User } from '../models/User';
import { jwtConfig } from './auth.config';

export const configurePassport = () => {
  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtConfig.secret,
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.userId);
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Google Strategy
  /*
  passport.use(
    new GoogleStrategy(
      {
        clientID: authConfig.google.clientId,
        clientSecret: authConfig.google.clientSecret,
        callbackURL: authConfig.google.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails?.[0].value });
          
          if (!user) {
            user = await User.create({
              email: profile.emails?.[0].value,
              name: profile.displayName,
              profilePicture: profile.photos?.[0].value,
              authMethods: { google: true },
              preferredAuthMethod: 'google'
            });
          } else if (!user.authMethods.google) {
            user.authMethods.google = true;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );

  // Facebook Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: authConfig.facebook.clientId,
        clientSecret: authConfig.facebook.clientSecret,
        callbackURL: authConfig.facebook.callbackURL,
        profileFields: ['id', 'emails', 'name', 'picture'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails?.[0].value });

          if (!user) {
            user = await User.create({
              email: profile.emails?.[0].value,
              name: `${profile.name?.givenName} ${profile.name?.familyName}`,
              profilePicture: profile.photos?.[0].value,
              authMethods: { facebook: true },
              preferredAuthMethod: 'facebook'
            });
          } else if (!user.authMethods.facebook) {
            user.authMethods.facebook = true;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );

  // LinkedIn Strategy
  passport.use(
    new LinkedInStrategy(
      {
        clientID: authConfig.linkedin.clientId,
        clientSecret: authConfig.linkedin.clientSecret,
        callbackURL: authConfig.linkedin.callbackURL,
        scope: ['r_emailaddress', 'r_liteprofile'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails?.[0].value });

          if (!user) {
            user = await User.create({
              email: profile.emails?.[0].value,
              name: profile.displayName,
              profilePicture: profile.photos?.[0].value,
              authMethods: { linkedin: true },
              preferredAuthMethod: 'linkedin'
            });
          } else if (!user.authMethods.linkedin) {
            user.authMethods.linkedin = true;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );

  // Instagram Strategy
  passport.use(
    new InstagramStrategy(
      {
        clientID: authConfig.instagram.clientId,
        clientSecret: authConfig.instagram.clientSecret,
        callbackURL: authConfig.instagram.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails?.[0].value });

          if (!user) {
            user = await User.create({
              email: profile.emails?.[0].value,
              name: profile.displayName,
              profilePicture: profile.photos?.[0].value,
              authMethods: { instagram: true },
              preferredAuthMethod: 'instagram'
            });
          } else if (!user.authMethods.instagram) {
            user.authMethods.instagram = true;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );
  */
}; 