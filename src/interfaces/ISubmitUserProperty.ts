import { Request } from "express";
import ISubmitedProperty from "./ISubmitedProperty";

export default interface ISubmitUserPropertyRequest extends Request {
    body: {
        userEmail: string;
        submitedProperty: ISubmitedProperty
    }
}