import axios from 'axios';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

let baseUrl = process.env.BASE_API_URL ?? 'http://lift-tracker.io/api/';

if (typeof baseUrl === 'string') {
    baseUrl = baseUrl.replace(/\/+$/, '');
} else {
    console.warn('No api base url configured.')
}

const ApiService = {

    get(resourceType, resourceUuid = null) {
        return axios.get(this.makeEndpointUrl(resourceType, resourceUuid));
    },

    save(resourceType, payload) {
        if (payload.uuid) {
            return this.put(resourceType, payload.uuid, payload);
        }

        return this.post(resourceType, payload);
    },

    post(resourceType, resourceUuid, payload) {
        return axios.post(this.makeEndpointUrl(resourceType, resourceUuid), payload);
    },

    put(resourceType, resourceUuid, payload) {
        return axios.put(this.makeEndpointUrl(resourceType, resourceUuid), payload);
    },

    delete(resourceType, resourceUuid) {
        return axios.delete(this.makeEndpointUrl(resourceType, resourceUuid));
    },

    makeEndpointUrl(resourceType, resourceUuid = null) {
        let url = `${baseUrl}/${resourceType}`;

        if (resourceUuid !== null) {
            url += `/${resourceUuid}`
        }

        return url;
    },

    setCsrfToken(csrfToken) {
        // Register the CSRF Token as a common header with Axios requests.
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    }

};

export default ApiService;
