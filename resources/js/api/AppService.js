import ApiService from './ApiService';

const RESOURCE_NAME = 'app';
const LOGOUT_URI = 'logout';

const WorkoutProgramService = {

    async getBootstrapData() {
        const result =  await ApiService.get(RESOURCE_NAME);

        ApiService.setCsrfToken(result.data.csrfToken);

        return result;
    },

    async logout() {
        const result =  await ApiService.simplePost(LOGOUT_URI);

        ApiService.setCsrfToken(null);

        return result;
    }

};

export default WorkoutProgramService;
