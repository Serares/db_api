import { Schema, model, Document, Error } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../../utils/secrets';
import { nanoid } from "nanoid";
import { SubmitedPropertyDocument } from "../properties/SubmitedProperty";

export type BasicUserDocument = Document & {
    shortId: string;
    email: string;
    password: string;
    name: string;
    passwordResetToken: string;
    passwordResetExpires: Date;
    submitedProperties: Schema.Types.ObjectId[];
    comparePassword: comparePasswordMethod;
    signJwt: signJwtMethod;
    addSubmitedProperty: addSubmitedPropertyMethod,
    removeSubmitedProperty: removeSubmitedPropertyMethod,
    generateResetPasswordToken: generateResetPasswordTokenMethod;
    resetPassword: resetPasswordMethod;
};

type comparePasswordMethod = (userPassword: string, cb: (err: Error, isMatch: boolean) => void) => void;
type signJwtMethod = () => string;
type addSubmitedPropertyMethod = (property: SubmitedPropertyDocument) => Promise<BasicUserDocument>;
type removeSubmitedPropertyMethod = (propertyId: any) => Promise<BasicUserDocument>;
type generateResetPasswordTokenMethod = () => string;
type resetPasswordMethod = (data: { token: string, newPassword: string }, cb: (err: Error, success: any) => void) => void;

const UserSchemaFields = {
    shortId: {
        type: String,
        default: nanoid(6)
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: false,
        default: "0000"
    },
    submitedProperties: [
        {
            type: Schema.Types.ObjectId,
            ref: "UserSubmitedProperty"
        }
    ]
};

const userSchema = new Schema(UserSchemaFields, { timestamps: true });

userSchema.pre("save", function (next) {
    const user = this as BasicUserDocument;
    if (!user.isModified("password")) { return next(); }
    // auto generates the salt
    bcrypt.hash(user.password, 8)
        .then(hashedPassword => {
            user.password = hashedPassword;
            next();
        })
        .catch(err => {
            return next(err);
        })
});

const comparePassword: comparePasswordMethod = function (userPassword, cb) {
    bcrypt.compare(userPassword, this.password, (err: Error, isMatch: boolean) => {
        cb(err, isMatch);
    });
};

const signJwt: signJwtMethod = function (): string {
    let user = this as BasicUserDocument;
    return jwt.sign({
        shortId: user.shortId,
        email: user.email
    }, TOKEN_SECRET, { expiresIn: "7d" })
};

const addSubmitedProperty: addSubmitedPropertyMethod = function (property) {
    let user = this as BasicUserDocument;
    const updatedProperties = [...user.submitedProperties];

    updatedProperties.push(property._id);
    user.submitedProperties = updatedProperties;
    return user.save();
};

const removeSubmitedProperty: removeSubmitedPropertyMethod = function (propertyId) {
    let user = this as BasicUserDocument;
    const updatedProperties = user.submitedProperties.filter(item => {
        //TODO debug
        //@ts-ignore
        return item._id.toString() !== propertyId.toString();
    });

    user.submitedProperties = updatedProperties;
    return user.save();
};

const generateResetPasswordToken: generateResetPasswordTokenMethod = function () {
    let user = this as BasicUserDocument;
    // use users encrypted password as sign secret
    let payload = { shortId: user.shortId, email: user.email };
    let resetPwdToken = jwt.sign(payload, user.password);

    return resetPwdToken;
};

const resetPassword: resetPasswordMethod = function (data, cb) {
    let user = this as BasicUserDocument;

    jwt.verify(data.token, user.password, (err: Error, decoded: any) => {
        if (err) {
            return cb(err, null);
        }
        bcrypt.hash(data.newPassword, 8)
            .then(newHashedPassword => {
                user.password = newHashedPassword;
                cb(null, true)
            })
            .catch(err => {
                cb(err, null)
            })
    })
}

userSchema.methods.comparePassword = comparePassword;
userSchema.methods.signJwt = signJwt;
userSchema.methods.addSubmitedProperty = addSubmitedProperty;
userSchema.methods.removeSubmitedProperty = removeSubmitedProperty;
userSchema.methods.generateResetPasswordToken = generateResetPasswordToken;
userSchema.methods.resetPassword = resetPassword;

export const BasicUser = model<BasicUserDocument>("BasicUser", userSchema, "basicUsers");
