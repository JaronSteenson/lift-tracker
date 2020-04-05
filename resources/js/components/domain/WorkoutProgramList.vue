<template>
    <v-card
        flat
        tile
    >
        <v-container
            class="grey lighten-4"
            fluid
        >
            <h2 class="title text-center">Your workout programs</h2>

            <v-row>
                <v-spacer></v-spacer>
                <v-col
                    :key="program.id"
                    cols="12"
                    lg="3"
                    md="4"
                    sm="6"
                    v-for="program in workoutPrograms"
                >
                    <v-card
                        class="mx-auto"
                        max-width="344"
                        outlined
                    >
                        <v-list-item three-line>
                            <v-list-item-content>
                                <v-list-item-title class="headline mb-1">{{ program.name }}</v-list-item-title>
                                <v-list-item-subtitle>{{ program.description }}</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>

                        <v-card-actions>
                            <v-btn :to="{ name: 'programBuilder', params: { workoutProgramId: program.id } }"
                                   class="ma-2">
                                Edit
                                <v-icon right>mdi-pencil</v-icon>
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

                    <div class="text-center">
                        <v-btn :to="{ name: 'newProgramBuilder' }">
                            Build new program
                            <v-icon right>mdi-plus</v-icon>
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
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
        methods: {
            async fetchWorkoutPrograms() {
                this.loading = true;
                const response = await WorkoutProgramService.getAll();

                this.workoutPrograms = response.data;
                this.loading = false;
            }
        },
        computed: {
            ...mapGetters('app', {
                userFirstNamePossession: 'getUserFirstNamePossession'
            }),
        },
    }
</script>
