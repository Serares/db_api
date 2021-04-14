import { Request } from "express";
import ISubmitedProperty from "./ISubmitedProperty";

export default interface ISubmitUserProperty extends Request {
    body: {
        userEmail: string;
        submitedProperty: ISubmitedProperty
    }
}