import { Schema, model, Document, Error } from "mongoose";
import { nanoid } from "nanoid";
import { ETransactionType } from "../../interfaces/ETransactionType";
import { EPropertyTypes } from "../../interfaces/EPropertyTypes";

export type SubmitedPropertyDocument = Document & {
    shortId: string,
    price: number,
    propertyType: EPropertyTypes,
    transactionType: ETransactionType,
    images: string[],
    address: string,
    description: string,
    title: string,
    surface: number,
    rooms?: number,
    postedBy: Schema.Types.ObjectId
};

const SubmitedPropertySchemaFields = {
    shortId: {
        type: String,
        default: nanoid(4)
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
};

const submitedPropertySchema = new Schema(SubmitedPropertySchemaFields, { timestamps: true });

/*
apartmentSchema.pre("save", function (next) {
    let apartment = this as ApartmentDocument;
    if (!apartment.isNew) {
        next()
    }

    apartment.shortId = nanoid(10);
})
*/

export const SubmitedProperty = model<SubmitedPropertyDocument>("UserSubmitedProperty", submitedPropertySchema);
