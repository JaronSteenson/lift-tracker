import axios from 'axios';
import config from '../../../config.json';
import { debounce } from 'ts-debounce';

let baseUrl = config.apiBaseUrl;

if (typeof baseUrl !== 'string') {
    console.error('No api base url configured.');
}

const ApiService = {
    get(resourceType, resourceUuid = null) {
        return axios.get(this.makeEndpointUrl(resourceType, resourceUuid));
    },

    saveDebounced: null, // will be set at the end of the file

    save(resourceType, payload) {
        if (payload.createdAt) {
            return this.put(resourceType, payload);
        }

        return this.post(resourceType, payload);
    },

    post(resourceType, payload) {
        return axios.post(this.makeEndpointUrl(resourceType), payload);
    },

    put(resourceType, payload) {
        return axios.put(this.makeEndpointUrl(resourceType), payload);
    },

    delete(resourceType, resourceUuid) {
        return axios.delete(this.makeEndpointUrl(resourceType, resourceUuid));
    },

    makeEndpointUrl(resourceType, resourceUuid = null) {
        let url = `${baseUrl}/${resourceType}`;

        if (resourceUuid !== null) {
            url += `/${resourceUuid}`;
        }

        return url;
    },
};

export default ApiService;

ApiService.saveDebounced = debounce(ApiService.save, 500);
