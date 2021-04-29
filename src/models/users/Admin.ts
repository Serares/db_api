import { Schema, model, Document, Error } from "mongoose";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../../utils/secrets';
import { EPropertyTypes } from "../../interfaces/EPropertyTypes";
import { ApartmentDocument } from '../properties/Apartment';

export type AdminDocument = Document & {
    shortId: string;
    name: string;
    email: string;
    password: string;
    phoneNumber: number;
    addedProperties: {
        // TODO add documents of models
        1: Schema.Types.ObjectId[],
        2: Schema.Types.ObjectId[],
        3: Schema.Types.ObjectId[]
    };
    comparePassword: comparePasswordMethod;
    signJwt: signJwtMethod;
    addSubmitedProperty: addSubmitedPropertyMethod,
    removeSubmitedProperty: removeSubmitedPropertyMethod,

};

type comparePasswordMethod = (userPassword: string, cb: (err: any, isMatch: any) => void) => void;
type signJwtMethod = () => string;
//TODO
type addSubmitedPropertyMethod = (property: any) => Promise<any>;
type removeSubmitedPropertyMethod = (propertyId: any, propertyType: number) => Promise<any>;

const AdminSchemaFields = {
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
        default: 0
    },
    addedProperties: {
        1: [
            {
                type: Schema.Types.ObjectId,
                ref: "Apartment"
            }
        ],
        2: [
            {
                type: Schema.Types.ObjectId,
                ref: "House"
            }
        ],
        3: [
            {
                type: Schema.Types.ObjectId,
                ref: "Land"
            }
        ]
    }
};

const userSchema = new Schema(AdminSchemaFields, { timestamps: true });

userSchema.pre("save", function (next) {
    const user = this as AdminDocument;
    if (!user.isModified("password")) { return next(); }
    // auto generates the salt
    bcrypt.hash(user.password, 12)
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
    let user = this as AdminDocument;
    return jwt.sign({
        shortId: user.shortId,
        email: user.email,
        isAdmin: true
    }, TOKEN_SECRET, { expiresIn: "7d" })
};

const removeSubmitedProperty: removeSubmitedPropertyMethod = function (propertyId, propertyType) {
    let user = this as AdminDocument;
    let type = 0 as keyof typeof user.addedProperties;
    switch (propertyType) {
        case (EPropertyTypes.APARTMENT):
            type = EPropertyTypes.APARTMENT;
            break;
        case (EPropertyTypes.HOUSE):
            type = EPropertyTypes.HOUSE;
            break;
        case (EPropertyTypes.LANDANDCOMMERCIAL):
            type = EPropertyTypes.LANDANDCOMMERCIAL;
            break;
    }
    const updatedProperties = user.addedProperties[type].filter(item => {
        //TODO debug
        //@ts-ignore
        return item._id.toString() !== propertyId.toString();
    });

    user.addedProperties[type] = updatedProperties;
    return user.save();
};

const addSubmitedProperty: addSubmitedPropertyMethod = function (property) {
    let user = this as AdminDocument;
    let propType = property.propertyType as keyof typeof user.addedProperties;

    const updatedProperties = [...user.addedProperties[propType]];

    updatedProperties.push(property._id);
    user.addedProperties[propType] = updatedProperties;
    return user.save();
};

userSchema.methods.comparePassword = comparePassword;
userSchema.methods.signJwt = signJwt;
userSchema.methods.removeSubmitedProperty = removeSubmitedProperty;
userSchema.methods.addSubmitedProperty = addSubmitedProperty;

export const Admin = model<AdminDocument>("Admin", userSchema, "adminUsers");
