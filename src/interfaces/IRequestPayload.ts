import { Request } from "express";


// had to create this interface
// because request object sometimes contains
// a mongo db user schema
export interface IRequestPayload extends Request {
    payload: {
        exp: number,
        iat: number,
        shortId: string,
        email: string,
        name?: string,
        imagesUrls?: string[],
        //uuid used to keep track of gcs subdirectory of posted images
        subdirectoryId: string,
        // created only from admin model
        isAdmin?: boolean
    }
}
