import { Schema, model, Document, Error } from "mongoose";
import { nanoid } from "nanoid";
import { ETransactionType } from "../../interfaces/ETransactionType";
import { EPropertyTypes } from "../../interfaces/EPropertyTypes";

export type FeaturesDocument = Document & {
    rooms: number,
    buildingType: string,
    comfort: string,
    usableArea: number,
    totalUsableArea: number,
    constructionYear: number,
    structure: string
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
    propertyType: EPropertyTypes,
    transactionType: ETransactionType,
    coords: number[],
    imagesUrls: string[],
    thumbnail: string,
    features: FeaturesDocument,
    utilities: UtilitiesDocument,
    amenities: AmenitiesDocument
};

const FeaturesSchema = new Schema<FeaturesDocument>({
    rooms: Number,
    buildingType: String,
    comfort: String,
    usableArea: Number,
    totalUsableArea: Number,
    constructionYear: Number,
    structure: String
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
        default: nanoid(5)
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
        type: String
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
        ref: "Admin"
    },
    utilities: UtilitiesSchema,
    features: FeaturesSchema,
    amenities: AmenitiesSchema
};

const apartmentSchema = new Schema(ApartmentSchemaFields, { timestamps: true });

apartmentSchema.pre("save", function (next) {
    let property = this as ApartmentDocument;
    if (!property.isNew) {
        next()
    }

    if (!property.thumbnail) {
        property.thumbnail = property.imagesUrls[0];
    }
})

export const Apartment = model<ApartmentDocument>("Apartment", apartmentSchema);
