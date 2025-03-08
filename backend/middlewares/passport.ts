import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import pool from '../config/db';
import { User as UserType } from '../@types/user';


declare global {
    namespace Express {
        interface User extends UserType {}
    }
}

passport.use(
    new LocalStrategy(
        { usernameField: 'userid', passwordField: 'password' },
        async (userid: string, password: string, done: (error: any, user?: UserType | false, options?: { message: string }) => void) => {
            try {
                // Run query and ensure rows is defined
                const result = await pool.query(
                    'SELECT * FROM users WHERE username = $1 OR email = $2',
                    [userid, userid]
                );

                if (!result || !result.rows) {
                    console.error("Database query failed or returned undefined.");
                    return done(null, false, { message: "Database error" });
                }

                const rows = result.rows;

                if (rows.length === 0) {
                    return done(null, false, { message: "User not found" });
                }

                const user: UserType = rows[0];

                // Compare password
                const isValid = password === user.password;
                if (!isValid) {
                    return done(null, false, { message: "Invalid password" });
                }

                return done(null, user as UserType);

            } catch (error) {
                console.error("Database error:", error);
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done: (err: any, user?: UserType | false) => void) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

        if (result.rowCount <= 0) return done(null, false);
        
        const rows = result.rows;
        done(null, rows[0] as UserType);
    } catch (error) {
        done(error);
    }
});

export default passport;
