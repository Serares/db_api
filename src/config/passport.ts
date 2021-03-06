import passport from 'passport';
import passportLocal from 'passport-local';
import { BasicUser, BasicUserDocument } from '../models/users/Basic';

const LocalStrategy = passportLocal.Strategy;

passport.use("loginBasic", new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
    BasicUser.findOne({ email: email }, (err: any, user: BasicUserDocument) => {
        if (err) return done(err);

        if (!user) {
            return done(null, false, { message: `Email ${email} not found.` })
        }

        user.comparePassword(password, (err: Error, isMatch: boolean) => {
            if (err) { return done(err) };
            if (isMatch) {
                return done(null, user);
            }

            return done(null, false, { message: "Invalid email or password." });
        })
    })
}));

//TODO
passport.use("loginAdmin", new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {

}));
