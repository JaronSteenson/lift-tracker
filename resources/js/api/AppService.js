import ApiService from './ApiService';

const RESOURCE_NAME = 'app';
const LOGIN_URI = 'login';
const SIGN_UP_URI = 'sign-up';
const LOGOUT_URI = 'logout';

const WorkoutProgramService = {

    async getBootstrapData() {
        const response = await ApiService.get(RESOURCE_NAME);

        ApiService.setCsrfToken(response.data.app.csrfToken);

        return response;
    },

    async logout() {
        const response = await ApiService.simplePost(LOGOUT_URI);

        // The csrf token is regenerated on logout.
        ApiService.setCsrfToken(response.data.app.csrfToken);

        return response;
    }

};

export default WorkoutProgramService;
