import { Schema, model, Document, Error } from "mongoose";
import { nanoid } from "nanoid";
import { ETransactionType } from "../../interfaces/ETransactionType";
import { EPropertyTypes } from "../../interfaces/EPropertyTypes";

type FeaturesDocument = Document & {
    rooms: number,
    buildingType: string,
    comfort: string,
    usableArea: number,
    totalUsableArea: number,
    constructionYear: number,
    structure: string
};

type UtilitiesDocument = Document & {
    general: string[],
    heatingSystem: string[],
    conditioning: string[]
};

type AmenitiesDocument = Document & {
    building: string[]
};

export type HouseDocument = Document & {
    shortId: string,
    title: string,
    description: string,
    address: string,
    price: number,
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

const HouseSchemaFields = {
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
        default: EPropertyTypes.HOUSE
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

const HouseSchema = new Schema(HouseSchemaFields, { timestamps: true });

/**
 * Returns a promise containing remaining imagesUrls
 */
 const removeImages: removeImagesMethod = function (removedImages) {
    let property = this as HouseDocument;
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
    const property = this as HouseDocument;
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

HouseSchema.methods.removeImages = removeImages;
HouseSchema.methods.addNewImagesUrls = addNewImagesUrls;

export const HouseModel = model<HouseDocument>("House", HouseSchema);
