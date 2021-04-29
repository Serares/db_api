import { Request, Response, NextFunction } from 'express';
import { sendJSONresponse } from '../../utils/sendJsonResponse';
import { ApartmentModel } from '../../models/properties/Apartment';
import { IRequestPayload } from '../../interfaces/IRequestPayload';
import { Admin } from '../../models/users/Admin';
import { EPropertyTypes } from '../../interfaces/EPropertyTypes';
import { removeSubmitedImages } from '../../middleware/gcsStorage';

/**
 * @route GET /admin/getApartment/:shortId
 */
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let property = await ApartmentModel.findOne({ shortId: req.params.shortId }).populate("postedBy");

        sendJSONresponse(res, 200, property);
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }

};

/**
 * @route POST /admin/addApartment
 */
export const add = async (req: IRequestPayload, res: Response, next: NextFunction) => {
    try {
        if (!req.body && !req.files) {
            return sendJSONresponse(res, 401, { message: "No request body" });
        }
        const adminEmail = req.payload.email;
        const admin = await Admin.findOne({ email: adminEmail });
        if (!admin) {
            return sendJSONresponse(res, 404, { message: `Can't find admin with this email ` + adminEmail })
        };

        let newProperty = new ApartmentModel({
            title: req.body.title,
            descripton: req.body.description,
            address: req.body.address,
            price: req.body.price,
            imagesUrls: req.payload.imagesUrls,
            thumbnail: req.payload.imagesUrls[0],
            coords: [Number(req.body.lng), Number(req.body.lat)],
            transactionType: Number(req.body.transactionType),
            postedBy: admin._id,
            gcsSubfolderId: req.payload.subdirectoryId,
            features: {
                rooms: req.body.features.rooms,
                buildingType: req.body.features.buildingType,
                partitioning: req.body.features.partitioning,
                floor: req.body.features.floor,
                comfort: req.body.features.comfort,
                usableArea: req.body.features.usableArea,
                totalUsableArea: req.body.features.totalUsableArea,
                constructionYear: req.body.features.constructionYear,
                structure: req.body.features.structure
            },
            utilities: {
                general: req.body.utilities.general,
                heatingSystem: req.body.utilities.heatingSystem,
                conditioning: req.body.utilities.conditioning
            },
            amenities: {
                building: req.body.amenities.building
            }
        });
        await newProperty.save();
        await admin.addSubmitedProperty(newProperty);

        sendJSONresponse(res, 200, { message: "Apartment added success!" });
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }
};

/**
 * @route PUT /admin/updateApartment/:shortId
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //TODO
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }
};

/**
 * @route DELETE /admin/removeApartment/:shortId
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shortId = req.params.shortId;
        let apartment = await ApartmentModel.findOne({ shortId });
        if (apartment) {
            const admin = await Admin.findOne({ _id: apartment.postedBy });
            admin.removeSubmitedProperty(apartment._id, EPropertyTypes.APARTMENT);
            await removeSubmitedImages(apartment.gcsSubfolderId, true);
            await apartment.remove();
            sendJSONresponse(res, 200, { message: "Apartment with " + shortId + " removed from db" });
        }
    } catch (err) {
        sendJSONresponse(res, 500, err);
    }

};
