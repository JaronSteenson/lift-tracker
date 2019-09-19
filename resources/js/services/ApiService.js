import axios from 'axios';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Register the CSRF Token as a common header with Axios requests.
let csrfToken = document.head.querySelector('meta[name="csrf-token"]');

axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.content;

let url = window.apiBaseUrl;

const baseUrl = url.replace(/\/+$/, '');

if (typeof baseUrl !== 'string') {
    throw new Error('Base url not configure ' + JSON.stringify(url) + ' was supplied')
}



const ApiService = {

    get(resourceType, resourceId = null) {
        return this.dataFrom(axios.get(this.makeEndpointUrl(resourceType, resourceId)));
    },

    save(resourceType, payload) {
        if (payload.id) {
            return this.put(resourceType, payload.id, payload);
        }

        return this.post(resourceType, payload);
    },

    post(resourceType, payload) {
        return this.dataFrom(axios.post(this.makeEndpointUrl(resourceType), payload));
    },

    put(resourceType, resourceId, payload) {
        return this.dataFrom(axios.put(this.makeEndpointUrl(resourceType, resourceId), payload));
    },

    delete(resourceType, resourceId) {
        return this.dataFrom(axios.delete(this.makeEndpointUrl(resourceType, resourceId)));
    },

    makeEndpointUrl(resourceType, resourceId = null) {
        let url = `${baseUrl}/${resourceType}`;

        if (resourceId !== null) {
            url += `/${resourceId}`
        }

        return url;
    },

    async dataFrom(request) {
        const result =  await request;

        return result.data;
    },
};

export default ApiService;
