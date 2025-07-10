import axios from "axios";

let baseUrl = process.env.API_BASE_URL ?? "/api";

if (typeof baseUrl === "string") {
    baseUrl = baseUrl.replace(/\/+$/, "");
} else {
    console.error("No api base url configured.");
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

    registerResponseInterceptor(onFulfilled, onRejected) {
        axios.interceptors.response.use(onFulfilled, onRejected);
    },
};

export default ApiService;
