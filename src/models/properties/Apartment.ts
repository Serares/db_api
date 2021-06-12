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
    isFeatured: boolean,
    removeImages: removeImagesMethod,
    addNewImagesUrls: addNewImagesUrlsMethod
};

/**
 * Remove images existing in property document
 */
type removeImagesMethod = (removedImages: Array<string>) => Promise<Array<string>>;
type addNewImagesUrlsMethod = (newImagesUrls: Array<string>) => Promise<Array<string>>;

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

/**
 * Returns a promise containing remaining imagesUrls
 */
const removeImages: removeImagesMethod = function (removedImages) {
    let property = this as ApartmentDocument;
    return new Promise(async (resolve, reject) => {
        try {
            let newImagesUrls = property.imagesUrls.filter((image) => {
                return !removedImages.includes(image);
            });
            property.imagesUrls = newImagesUrls;
            await property.save();
            resolve(newImagesUrls);
        } catch (err) {
            reject(err)
        }
    })
}

const addNewImagesUrls: addNewImagesUrlsMethod = function (newImagesUrls: Array<string>) {
    const property = this as ApartmentDocument;
    return new Promise(async (resolve, reject) => {
        try {
            property.imagesUrls = [...newImagesUrls, ...property.imagesUrls];
            await property.save();
            resolve(property.imagesUrls);
        } catch (err) {
            reject(err)
        }
    })
}

ApartmentSchema.methods.removeImages = removeImages;
ApartmentSchema.methods.addNewImagesUrls = addNewImagesUrls;

export const ApartmentModel = model<ApartmentDocument>("Apartment", ApartmentSchema);
