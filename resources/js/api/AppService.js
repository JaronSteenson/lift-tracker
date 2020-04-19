import ApiService from './ApiService';

const RESOURCE_NAME = 'app';
const LOGIN_URI = 'login';
const LOGOUT_URI = 'logout';

const WorkoutProgramService = {

    async getBootstrapData() {
        const result = await ApiService.get(RESOURCE_NAME);

        ApiService.setCsrfToken(result.data.csrfToken);

        return result;
    },

    async login(payload) {
        const result = await ApiService.simplePost(LOGIN_URI, payload);

        ApiService.setCsrfToken(result.data.csrfToken);

        return result;
    },

    async logout() {
        const result = await ApiService.simplePost(LOGOUT_URI);

        // The csrf token is regenerated on logout.
        ApiService.setCsrfToken(result.data.csrfToken);

        return result;
    }

};

export default WorkoutProgramService;
