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
/**
 * Returns a promise containing remaining imagesUrls
 */
 const removeImages: removeImagesMethod = function (removedImages) {
    let property = this as LandDocument;
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
    const property = this as LandDocument;
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

LandSchema.methods.removeImages = removeImages;
LandSchema.methods.addNewImagesUrls = addNewImagesUrls;

export const LandModel = model<LandDocument>("Land", LandSchema);
