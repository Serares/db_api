import { Request, Response, NextFunction } from 'express';
import ISubmitUserProperty from '../interfaces/ISubmitUserProperty';
import ISubmitedProperty from '../interfaces/ISubmitedProperty';
import { SubmitedProperty } from '../models/properties/SubmitedProperty';
import { BasicUser, BasicUserDocument } from '../models/users/Basic';
import passport from 'passport';
import logger, { timeNow } from '../utils/logger';

const sendJSONresponse = function (res: Response, status: number, content: any) {
    res.status(status).json(content);
};
/**
 * @route POST /user/submitProperty
 */
export const submitUserProperty = async (req: ISubmitUserProperty, res: Response, next: NextFunction) => {

    if (!req.body) {
        return sendJSONresponse(res, 401, { message: "No request body" });
    }
    const userEmail = req.body.userEmail;
    try {
        const user = await BasicUser.findOne({ email: userEmail });
        if (!user) {
            return sendJSONresponse(res, 404, { message: `Can't find user with this ${userEmail} email` })
        }

        const newSubmitedProperty = new SubmitedProperty({
            postedBy: user._id,
            title: req.body.submitedProperty.title,
            description: req.body.submitedProperty.description,
            transactionType: Number(req.body.submitedProperty.transactionType),
            propertyType: Number(req.body.submitedProperty.propertyType),
            surface: Number(req.body.submitedProperty.surface),
            price: Number(req.body.submitedProperty.price),
            address: req.body.submitedProperty.address
        });

        if (req.body.submitedProperty.rooms) {
            newSubmitedProperty.rooms = Number(req.body.submitedProperty.rooms);
        }
        await user.addSubmitedProperty(newSubmitedProperty)
        await newSubmitedProperty.save();

        return sendJSONresponse(res, 200, { message: "Property added success" });
    } catch (err) {
        logger.debug("Error on submit basic property -> " + `${err} ` + timeNow);
        return sendJSONresponse(res, 500, err);
    }
}

/**
 * @route POST /user/signup 
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
        return sendJSONresponse(res, 401, { message: "No request body" });
    }

    try {
        let userExists = await BasicUser.findOne({ email: req.body.email });
        if (userExists) {
            return sendJSONresponse(res, 401, { message: "User with that email already exists" })
        };

        const newUser = new BasicUser({
            email: req.body.email,
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password
        })

        await newUser.save();

        return sendJSONresponse(res, 200, { message: "User created success" });
    } catch (err) {
        logger.debug("Error on signup -> " + `${err} ` + timeNow);
        return sendJSONresponse(res, 500, err);
    }
}

/**
 * @route POST /user/login 
 */
export const postLogin = (req: ISubmitUserProperty, res: Response, next: NextFunction) => {
    passport.authenticate('loginBasic', (err, user: BasicUserDocument, info) => {
        if (err) {
            return sendJSONresponse(res, 404, err);
        }

        if (user) {
            const token = user.signJwt();
            return sendJSONresponse(res, 200, { "token": token });
        }

        return sendJSONresponse(res, 401, info);
    })(req, res, next);
}

/**
 * @route POST /user/forgotPassword 
 */
export const postForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await BasicUser.findOne({ email: req.body.email });

        if (!user) {
            return sendJSONresponse(res, 401, { message: "User with that email is not registered" });
        }

        let token = user.generateResetPasswordToken();
        let responseObject = {
            token,
            name: user.name,
            email: user.email
        };

        return sendJSONresponse(res, 200, responseObject);
    } catch (err) {
        logger.debug("Error on signup -> " + `${err} ` + timeNow);
        return sendJSONresponse(res, 500, err);
    }
}

/**
 * @route POST /user/resetPassword 
 */
export const postResetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.newPassword) throw new Error("No new password provided");

        const user = await BasicUser.findOne({ shortId: req.body.shortId });

        if (!user) {
            return sendJSONresponse(res, 401, { message: "Can't find user in database please redo the process" });
        }

        user.resetPassword({ token: req.body.token, newPassword: req.body.newPassword }, (err: any, success: any) => {
            if (err) {
                throw err;
            }
            if (success) {
                return sendJSONresponse(res, 200, { message: "Password change success" })
            }
        });

    } catch (err) {
        logger.debug("Error on signup -> " + `${err} ` + timeNow);
        return sendJSONresponse(res, 500, err);
    }
}
