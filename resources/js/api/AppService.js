import ApiService from './ApiService';

const RESOURCE_NAME = 'app';

const WorkoutProgramService = {

    async getBootstrapData() {
        const result =  await ApiService.get(RESOURCE_NAME);

        ApiService.setCsrfToken(result.data.csrfToken);

        return result;
    },

};

export default WorkoutProgramService;
