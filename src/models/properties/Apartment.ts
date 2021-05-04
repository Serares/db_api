import { Schema, model, Document, Error } from "mongoose";
import { nanoid } from "nanoid";
import { ETransactionType } from "../../interfaces/ETransactionType";
import { EPropertyTypes } from "../../interfaces/EPropertyTypes";

export type FeaturesDocument = Document & {
    rooms: number,
    buildingType: string,
    comfort: string,
    partitioning: string,
    usableArea: number,
    totalUsableArea: number,
    constructionYear: number,
    structure: string,
    floor: number
};

export type UtilitiesDocument = Document & {
    general: string[],
    heatingSystem: string[],
    conditioning: string[]
};

export type AmenitiesDocument = Document & {
    building: string[]
};

export type ApartmentDocument = Document & {
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
    utilities: UtilitiesDocument,
    amenities: AmenitiesDocument,
    postedBy: Schema.Types.ObjectId,
    gcsSubfolderId: string,
    isFeatured: boolean
};

const FeaturesSchema = new Schema<FeaturesDocument>({
    rooms: Number,
    buildingType: String,
    comfort: String,
    partitioning: String,
    usableArea: Number,
    totalUsableArea: Number,
    constructionYear: Number,
    structure: String,
    floor: String
});

const UtilitiesSchema = new Schema<UtilitiesDocument>({
    general: [String],
    heatingSystem: [String],
    conditioning: [String]
});

const AmenitiesSchema = new Schema<AmenitiesDocument>({
    building: [String]
});

const ApartmentSchemaFields = {
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
        default: EPropertyTypes.APARTMENT
    },
    transactionType: {
        type: Number,
        required: true
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Admin"
    },
    isFeatured: {
        type: Boolean,
        require: false,
        default: false
    },
    gcsSubfolderId: {
        type: String,
        required: true
    },
    utilities: UtilitiesSchema,
    features: FeaturesSchema,
    amenities: AmenitiesSchema
};

const ApartmentSchema = new Schema(ApartmentSchemaFields, { timestamps: true });

export const ApartmentModel = model<ApartmentDocument>("Apartment", ApartmentSchema);
