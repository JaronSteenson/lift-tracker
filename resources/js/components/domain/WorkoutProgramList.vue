<template>
    <VContainer fluid>
        <h2 class="title">Your workout programs</h2>

        <v-row :justify="hasNoWorkoutProgram ? 'center' : 'start'">
            <v-col
                :key="program.id"
                cols="12"
                lg="3"
                md="4"
                sm="6"
                v-for="program in workoutPrograms"
            >
                <v-card width="100%">
                    <v-list-item three-line>
                        <v-list-item-content>
                            <v-list-item-title class="headline mb-1">{{ program.name }}</v-list-item-title>
                            <v-list-item-subtitle>Created: {{ program.createdAt }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>

                    <v-card-actions>
                        <v-btn :to="{ name: 'programBuilder', params: { workoutProgramUuid: program.uuid } }"
                               class="ma-2">
                            <v-icon left>mdi-pencil</v-icon>
                            Edit
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col
                cols="12"
                lg="3"
                md="4"
                sm="6"
            >
                <v-btn :to="{ name: 'newProgramBuilder' }" width="100%">
                    <v-icon left>mdi-plus</v-icon>
                    Build new program
                </v-btn>
            </v-col>
        </v-row>
    </VContainer>
</template>

<script>
    import WorkoutProgramService from '../../api/WorkoutProgramService';
    import LoadingSpinner from '../LoadingSpinner';
    import {mapGetters} from "vuex";

    export default {
        components: {
            LoadingSpinner,
        },
        created() {
            this.fetchWorkoutPrograms();
        },
        watch: {
            // call again the method if the route changes
            '$route': 'fetchWorkoutPrograms'
        },
        data() {
            return {
                workoutPrograms: [],
                loading: true,
            }
        },
        computed: {
            hasNoWorkoutProgram() {
                return this.workoutPrograms.length === 0;
            }
        },
        methods: {
            async fetchWorkoutPrograms() {
                this.loading = true;
                const response = await WorkoutProgramService.getAll();

                this.workoutPrograms = response.data;
                this.loading = false;
            }
        },
    }
</script>
