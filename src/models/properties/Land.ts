import { Schema, model, Document, Error } from "mongoose";
import { nanoid } from "nanoid";
import { ETransactionType } from "../../interfaces/ETransactionType";
import { EPropertyTypes } from "../../interfaces/EPropertyTypes";

export type FeaturesDocument = Document & {
    usableArea: number,
    totalUsableArea: number
};

export type LandDocument = Document & {
    shortId: string,
    price: number,
    title: string,
    description: string,
    address: string,
    propertyType: EPropertyTypes,
    transactionType: ETransactionType,
    coords: number[],
    imagesUrls: string[],
    thumbnail: string,
    features: FeaturesDocument,
    postedBy: Schema.Types.ObjectId,
    gcsSubfolderId: string,
    isFeatured: boolean
};

const FeaturesSchema = new Schema<FeaturesDocument>({
    usableArea: Number,
    totalUsableArea: Number,
});

const LandSchemaFields = {
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
    price: {
        type: Number,
        required: true
    },
    imagesUrls: {
        type: [String],
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    // Always store coordinates longitude, latitude order.
    coords: {
        type: [Number],
        index: "2dsphere",
        required: true
    },
    propertyType: {
        type: Number,
        require: true,
        default: EPropertyTypes.LANDANDCOMMERCIAL
    },
    transactionType: {
        type: Number,
        required: true
    },
    isFeatured: {
        type: Boolean,
        require: false,
        default: false
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Admin"
    },
    gcsSubfolderId: {
        type: String,
        required: true
    },
    features: FeaturesSchema
};

const LandSchema = new Schema(LandSchemaFields, { timestamps: true });

export const LandModel = model<LandDocument>("Land", LandSchema);
