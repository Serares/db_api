import { Schema, model, Document, Error } from "mongoose";
import { nanoid } from "nanoid";
import { ETransactionType } from "../../interfaces/ETransactionType";
import { EPropertyTypes } from "../../interfaces/EPropertyTypes";

export type SubmitedPropertyDocument = Document & {
    shortId: string,
    price: number,
    propertyType: EPropertyTypes,
    transactionType: ETransactionType,
    imagesUrls: string[],
    thumbnail: string,
    address: string,
    description: string,
    title: string,
    surface: number,
    rooms?: number,
    postedBy: Schema.Types.ObjectId,
    gcsSubfolderId: string
};

// TODO create a nested schema for property characteristics
const SubmitedPropertySchemaFields = {
    shortId: {
        type: String,
        default: nanoid(7)
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    surface: {
        type: Number,
        require: true
    },
    price: {
        type: Number,
        required: true
    },
    rooms: {
        type: Number,
        required: false,
        default: 0
    },
    propertyType: {
        type: Number,
        required: true
    },
    transactionType: {
        type: Number,
        required: true
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: "BasicUser"
    },
    imagesUrls: [{
        type: String,
        required: true
    }],
    thumbnail: {
        type: String,
        requred: true
    },
    gcsSubfolderId: {
        type: String,
        required: true
    }
};

const submitedPropertySchema = new Schema(SubmitedPropertySchemaFields, { timestamps: true });

export const SubmitedProperty = model<SubmitedPropertyDocument>("UserSubmitedProperty", submitedPropertySchema);
