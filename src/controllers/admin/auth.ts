import { Request, Response, NextFunction } from 'express';
import logger, { timeNow } from '../../utils/logger';
import { Admin, AdminDocument } from '../../models/users/Admin';
import { sendJSONresponse } from '../../utils/sendJsonResponse';
import passport from 'passport';
/**
 * @route POST /admin/login 
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            return sendJSONresponse(res, 401, { message: "No request body" });
        }

        passport.authenticate("loginAdmin", (err, user: AdminDocument, info) => {
            if (err) {
                return sendJSONresponse(res, 404, err);
            }

            if (user) {
                const token = user.signJwt();
                return sendJSONresponse(res, 200, token);
            }

            return sendJSONresponse(res, 401, info);
        })(req, res, next)

    } catch (err) {
        logger.debug("Error login admin ->" + err + " " + timeNow);
        sendJSONresponse(res, 500, { message: "Server error login" });
    }
};

/**
 * @route POST /admin/signup
 */
export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            return sendJSONresponse(res, 401, { message: "No request body" });
        };

        let userExists = await Admin.findOne({ email: req.body.email });
        if (userExists) {
            return sendJSONresponse(res, 401, { message: "User with that email already exists" })
        };

        const newAdmin = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber
        });
        await newAdmin.save();
        sendJSONresponse(res, 200, { message: "Admin creted success" });
    } catch (err) {
        logger.debug("Error creating admin ->" + err + " " + timeNow);
        sendJSONresponse(res, 500, { message: "Server error" });
    }
};
