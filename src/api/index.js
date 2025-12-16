import axios from "axios";
import {baseURL} from "./config";

const instance = axios.create({
    baseURL,
    responseType: 'json',
});

export const fetchTemplate = (key, config = {}) => {
    return instance.get(`/template/${key}`, config);
}
export const saveTemplate = (data, config = {}) => {
    return instance.post(`/template`, data, config);
}
