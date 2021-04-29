import { Request, Response, NextFunction } from 'express';
import { SubmitedProperty, SubmitedPropertyDocument } from '../models/properties/SubmitedProperty';
import { BasicUser } from '../models/users/Basic';
import logger, { timeNow } from '../utils/logger';
import { sendJSONresponse } from '../utils/sendJsonResponse';
import faker from 'faker';
import { removeSubmitedImages } from '../middleware/gcsStorage';
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
 * @route GET /admin/getAllAdminProperties
 */
export const getAllAadminProperties = async (req: Request, res: Response, next: NextFunction) => {
    //TODO


};

/**
 * mock add properties in db
 */

export const mockPropertiesCreation = async (req: Request, res: Response, next: NextFunction) => {
    // TODO
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
