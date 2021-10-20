import axios from 'axios';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

let baseUrl = process.env.BASE_API_URL ?? '/api/';

if (typeof baseUrl === 'string') {
    baseUrl = baseUrl.replace(/\/+$/, '');
} else {
    console.warn('No api base url configured.')
}

const ApiService = {

    get(resourceType, resourceUuid = null) {
        return axios.get(this.makeEndpointUrl(resourceType, resourceUuid));
    },

    simplePost(uri, payload = undefined) {
        return axios.post(`${baseUrl}/${uri}`, payload);
    },

    save(resourceType, payload) {
        if (payload.createdAt) {
            return this.put(resourceType, payload.uuid, payload);
        }

        return this.post(resourceType, payload);
    },

    post(resourceType, payload) {
        return axios.post(this.makeEndpointUrl(resourceType), payload);
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
    },

    registerResponseInterceptor(onFulfilled, onRejected) {
        axios.interceptors.response.use(onFulfilled, onRejected);
    },

};

export default ApiService;
