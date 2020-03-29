import axios from 'axios';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Register the CSRF Token as a common header with Axios requests.
let csrfToken = document.head.querySelector('meta[name="csrf-token"]');

axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.content;

let baseUrl = window.apiBaseUrl;

if (typeof baseUrl === 'string') {
    baseUrl = baseUrl.replace(/\/+$/, '');
} else {
    console.warn('No api base url configured.')
}

const ApiService = {

    get(resourceType, resourceId = null) {
        return axios.get(this.makeEndpointUrl(resourceType, resourceId));
    },

    save(resourceType, payload) {
        if (payload.id) {
            return this.put(resourceType, payload.id, payload);
        }

        return this.post(resourceType, payload);
    },

    post(resourceType, payload) {
        return axios.post(this.makeEndpointUrl(resourceType), payload);
    },

    put(resourceType, resourceId, payload) {
        return axios.put(this.makeEndpointUrl(resourceType, resourceId), payload);
    },

    delete(resourceType, resourceId) {
        return axios.delete(this.makeEndpointUrl(resourceType, resourceId));
    },

    makeEndpointUrl(resourceType, resourceId = null) {
        let url = `${baseUrl}/${resourceType}`;

        if (resourceId !== null) {
            url += `/${resourceId}`
        }

        return url;
    },

};

export default ApiService;
