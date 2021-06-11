import { Request, Response, NextFunction } from 'express';
import { SubmitedProperty, SubmitedPropertyDocument } from '../models/properties/SubmitedProperty';
import { BasicUser } from '../models/users/Basic';
import logger, { timeNow } from '../utils/logger';
import { sendJSONresponse } from '../utils/sendJsonResponse';
import faker from 'faker';
import { removeSubmitedImages } from '../middleware/gcsStorage';
import { ApartmentDocument, ApartmentModel } from '../models/properties/Apartment';
import { HouseDocument, HouseModel } from '../models/properties/House';
import { LandDocument, LandModel } from '../models/properties/Land';
/** Generic admin actions  */

/**
 * @route GET /admin/getAllSubmitedProperites 
 */
export const getAllSubmitedProperties = async (req: Request, res: Response, next: NextFunction) => {
    // TODO
    try {
        let properties = await SubmitedProperty.find();

        sendJSONresponse(res, 200, properties);
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }

};

/**
 * @route GET /admin/getOneSubmitedProperty/:shortId 
 */
export const getOneSubmitedProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let property = await SubmitedProperty.findOne({ shortId: req.params.shortId }).populate("postedBy");

        sendJSONresponse(res, 200, property);
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }

};

/**
 * @route GET /admin/removeOneSubmitedProperty/:shortId/:gcsSubfolderId
 */
export const removeOneSubmitedProperty = async (req: Request, res: Response, next: NextFunction) => {

    try {
        let shortId = req.params.shortId;
        let gcsSubfolderId = req.params.gcsSubfolderId;

        if (!shortId || !gcsSubfolderId) {
            throw new Error("No parameters provided");
        };
        // remove the property from BasicUser references
        let property = await SubmitedProperty.findOne({ shortId });
        if (property) {
            // TODO test
            //@ts-ignore
            const postedByUser = await BasicUser.findOne({ _id: property.postedBy });
            await postedByUser.removeSubmitedProperty(property._id);
            await removeSubmitedImages(gcsSubfolderId, false);
            await property.remove();
            sendJSONresponse(res, 200, { message: "Property with " + shortId + " deleted" });
        } else {
            sendJSONresponse(res, 401, { message: "Can't find property with id " + shortId });
        }

    } catch (err) {
        logger.debug("Fail deleting submited property removeOneSubmitedProperty " + err + " " + timeNow);
        sendJSONresponse(res, 500, err);
    }

};

/**
 * @route GET /admin/getProperties
 */
export const getAllAdminProperties = async (req: Request, res: Response, next: NextFunction) => {
    //TODO
    try {
        const projectionFields = ["thumbnail", "propertyType", "title", "address", "transactionType", "shortId"]
        const apartments = await ApartmentModel.find().select(projectionFields);
        const houses = await HouseModel.find().select(projectionFields);
        const lands = await LandModel.find().select(projectionFields);
        let concatenatedProperties = [...apartments, ...houses, ...lands];
        sendJSONresponse(res, 200, concatenatedProperties);
    } catch (err) {
        logger.debug(`Error getALlAdminProperties ${err} -> ${timeNow}`);
        sendJSONresponse(res, 500, err);
    }

};

/**
 * @route GET /admin/getFeaturedProperties
 */
export const getFeaturedProperties = async (req: Request, res: Response, next: NextFunction) => {
    //TODO
    try {
        const projectionFields = ["thumbnail", "features.usableArea", "features.rooms", "propertyType", "transactionType", "title", "address", "shortId", "price"]
        const apartments = await ApartmentModel.find({ isFeatured: true }).select(projectionFields);
        const houses = await HouseModel.find({ isFeatured: true }).select(projectionFields);
        const lands = await LandModel.find({ isFeatured: true }).select(projectionFields);
        let concatenatedProperties = [...apartments, ...houses, ...lands];
        sendJSONresponse(res, 200, concatenatedProperties);
    } catch (err) {
        logger.debug(`Error getALlAdminProperties ${err} -> ${timeNow}`);
        sendJSONresponse(res, 500, err);
    }

};

/**
 * mock add properties in db
 */

export const mockPropertiesCreation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let createdProperties: Array<SubmitedPropertyDocument> = [];
        for (let i = 0; i < 5; i++) {
            let imagesArray = [];
            imagesArray.push(faker.image.business());

            let property = new SubmitedProperty({
                postedBy: "6076bfe2c424204408eeca7b",
                gcsSubfolderId: "WSAF",
                title: faker.company.catchPhrase(),
                shortId: faker.random.alphaNumeric(5),
                description: faker.lorem.text(),
                address: faker.address.city(),
                surface: faker.datatype.number(300),
                price: faker.datatype.number(200),
                rooms: faker.datatype.number(5) || 0,
                propertyType: faker.datatype.number(3) || 1,
                transactionType: faker.datatype.number(2) || 1,
                thumbnail: faker.image.city(),
                imagesUrls: imagesArray
            })
            createdProperties.push(property);
        }
        await SubmitedProperty.insertMany(createdProperties);
        sendJSONresponse(res, 200, { message: "Properties created success" });
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }
};

export const mockApartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let createdProperties: Array<ApartmentDocument> = [];
        for (let i = 0; i < 5; i++) {
            let imagesArray = [];
            imagesArray.push(faker.image.business());

            let property = new ApartmentModel({
                shortId: faker.datatype.number(1000),
                price: faker.datatype.number(10000),
                thumbnail: faker.image.city(),
                imagesUrls: ["adminProperties/oIAaPwH/1620072313044_blob", "adminProperties/oIAaPwH/1620072313044_blob"],
                title: faker.hacker.noun(),
                address: faker.address.county(),
                postedBy: "608fd83c78bde6539cc4e74c",
                transactionType: faker.datatype.number(2) || 1,
                gcsSubfolderId: "9eyIVnH",
                isFeatured: faker.datatype.boolean(),
                features: {
                    rooms: faker.datatype.number(4),
                    buildingType: "bloc",
                    partitioning: "decomandat",
                    floor: 4,
                    comfort: "lucs",
                    usableArea: faker.datatype.number(50),
                    totalUsableArea: faker.datatype.number(50),
                    constructionYear: "2005",
                    structure: "beton",
                    buildingHeight: "S+P+4 Etaje"
                },
                // longitude latitude order
                coords: [25, 44],
                description: faker.lorem.paragraph(),
                utilities: {
                    general: ["Curent", "Apa", "Canalizare"],
                    heatingSystem: ["Centrala Proprie"],
                    conditioning: ["Aer conditionat"],
                },
                amenities: {
                    building: ["Interfon", "Curte"]
                }
            })
            createdProperties.push(property);
        }
        await ApartmentModel.insertMany(createdProperties);
        sendJSONresponse(res, 200, { message: "Properties created success" });
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }
};

export const mockHouses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let createdProperties: Array<HouseDocument> = [];
        for (let i = 0; i < 5; i++) {
            let imagesArray = [];
            imagesArray.push(faker.image.business());

            let property = new HouseModel({
                shortId: faker.datatype.number(1000),
                price: faker.datatype.number(10000),
                thumbnail: faker.image.city(),
                imagesUrls: ["adminProperties/oIAaPwH/1620072313044_blob", "adminProperties/oIAaPwH/1620072313044_blob"],
                title: faker.hacker.noun(),
                address: faker.address.county(),
                postedBy: "608fd83c78bde6539cc4e74c",
                transactionType: faker.datatype.number(2) || 1,
                gcsSubfolderId: "9eyIVnH",
                isFeatured: faker.datatype.boolean(),
                features: {
                    rooms: faker.datatype.number(4),
                    buildingType: "bloc",
                    partitioning: "decomandat",
                    floor: 4,
                    comfort: "lucs",
                    usableArea: faker.datatype.number(50),
                    totalUsableArea: faker.datatype.number(50),
                    constructionYear: "2005",
                    structure: "beton",
                    buildingHeight: "S+P+4 Etaje"
                },
                // longitude latitude order
                coords: [25, 44],
                description: faker.lorem.paragraph(),
                utilities: {
                    general: ["Curent", "Apa", "Canalizare"],
                    heatingSystem: ["Centrala Proprie"],
                    conditioning: ["Aer conditionat"],
                },
                amenities: {
                    building: ["Interfon", "Curte"]
                }
            })
            createdProperties.push(property);
        }
        await HouseModel.insertMany(createdProperties);
        sendJSONresponse(res, 200, { message: "Properties created success" });
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }
};

export const mockLands = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let createdProperties: Array<LandDocument> = [];
        for (let i = 0; i < 5; i++) {
            let imagesArray = [];
            imagesArray.push(faker.image.business());

            let property = new LandModel({
                shortId: faker.datatype.number(1000),
                price: faker.datatype.number(10000),
                thumbnail: faker.image.city(),
                imagesUrls: ["adminProperties/oIAaPwH/1620072313044_blob", "adminProperties/oIAaPwH/1620072313044_blob"],
                title: faker.hacker.noun(),
                address: faker.address.county(),
                postedBy: "608fd83c78bde6539cc4e74c",
                transactionType: faker.datatype.number(2) || 1,
                gcsSubfolderId: "9eyIVnH",
                isFeatured: faker.datatype.boolean(),
                features: {
                    usableArea: faker.datatype.number(50),
                    totalUsableArea: faker.datatype.number(50)
                },
                // longitude latitude order
                coords: [25, 44],
                description: faker.lorem.paragraph()
            })
            createdProperties.push(property);
        }
        await LandModel.insertMany(createdProperties);
        sendJSONresponse(res, 200, { message: "Properties created success" });
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }
};
