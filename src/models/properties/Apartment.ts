import { Schema, model, Document, Error } from "mongoose";
import { nanoid } from "nanoid";
import { ETransactionType } from "../../interfaces/ETransactionType";
import { EPropertyTypes } from "../../interfaces/EPropertyTypes";

export type ApartmentDocument = Document & {
    shortId: string,
    price: number,
    propertyType: EPropertyTypes,
    transactionType: ETransactionType,
    coords: number[]
};

const ApartmentSchemaFields = {
    shortId: {
        type: String,
        default: nanoid(10)
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
    price: {
        type: Number,
        required: true
    },
    // Always store coordinates longitude, latitude order.
    coords: {
        type: [Number],
        index: "2dsphere"
    },
    propertyType: {
        type: Number,
        default: EPropertyTypes.APARTMENT
    },
    transactionType: {
        type: Number,
        required: true
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    }
};

const apartmentSchema = new Schema(ApartmentSchemaFields, { timestamps: true });

/*
apartmentSchema.pre("save", function (next) {
    let apartment = this as ApartmentDocument;
    if (!apartment.isNew) {
        next()
    }

    apartment.shortId = nanoid(10);
})
*/

export const Apartment = model<ApartmentDocument>("Apartment", apartmentSchema);
