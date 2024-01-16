import ApiService from './ApiService';

const RESOURCE_NAME = 'app';
const LOG_IN = 'login';
const REGISTER = 'register';
const SEND_PASSWORD_RESET_EMAIL = 'send-password-reset-email';
const PASSWORD_RESET = 'password-reset';
const LOGOUT_URI = 'logout';

const WorkoutProgramService = {
    async getBootstrapData() {
        const response = await ApiService.get(RESOURCE_NAME);

        ApiService.setCsrfToken(response.data.app.csrfToken);

        return response;
    },

    async login({ email, password }) {
        try {
            const response = await ApiService.post(LOG_IN, { email, password });

            if (response.data.app) {
                // The csrf token is regenerated on login.
                ApiService.setCsrfToken(response.data.app.csrfToken);
            }

            return response;
        } catch (e) {
            if (e.response.status >= 200 && e.response.status < 500) {
                return e.response;
            }

            throw e;
        }
    },

    async register({ firstName, lastName, email, password, passwordConfirm }) {
        try {
            return await ApiService.post(REGISTER, {
                firstName,
                lastName,
                email,
                password,
                passwordConfirm,
            });
        } catch (e) {
            if (e.response.status >= 200 && e.response.status < 500) {
                return e.response;
            }
            throw e;
        }
    },

    async sendPasswordResetEmail({ email }) {
        try {
            return await ApiService.post(SEND_PASSWORD_RESET_EMAIL, {
                email,
            });
        } catch (e) {
            if (e.response.status >= 200 && e.response.status < 500) {
                return e.response;
            }
            throw e;
        }
    },

    async resetPassword({ email, password, passwordConfirm, token }) {
        try {
            return await ApiService.post(PASSWORD_RESET, {
                email,
                password,
                password_confirmation: passwordConfirm,
                token,
            });
        } catch (e) {
            if (e.response.status >= 200 && e.response.status < 500) {
                return e.response;
            }
            throw e;
        }
    },

    async logout() {
        const response = await ApiService.simplePost(LOGOUT_URI);

        // The csrf token is regenerated on logout.
        ApiService.setCsrfToken(response.data.app.csrfToken);

        return response;
    },
};

export default WorkoutProgramService;
