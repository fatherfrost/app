const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    passport.use(new GoogleStrategy({
            clientID: "9657143433-6neo8913ctdb0mevbren2mhtp4embu74.apps.googleusercontent.com",
            clientSecret: "VCqXhaVt9b3AhJznhqJuEoEH",
            callbackURL: "http://localhost:8080/auth/google/callback"
        },
        (token, refreshToken, profile, done) => {
            return done(null, {
                profile: profile,
                token: token
            });
        }));
}; 