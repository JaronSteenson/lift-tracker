<template>
    <VCard>
        <VCardTitle>
            <RouterLink
                v-if="linkTitle"
                :to="{
                    name: 'SessionOverviewPage',
                    params: {
                        workoutSessionUuid: workoutSession.uuid,
                    },
                }"
            >
                {{ workoutSession.name }}
            </RouterLink>
            <template v-else>{{ workoutSession.name }}</template>
        </VCardTitle>
        <VCardSubtitle>
            {{ date }}
        </VCardSubtitle>
        <VCardText class="pb-0">
            <CheckInFieldsDisplay
                :workoutSession="workoutSession"
                :timeStats="timeStats"
            />
        </VCardText>
        <VCardActions>
            <VBtn
                size="small"
                elevation="1"
                :to="{
                    name: 'CheckInEditPage',
                    params: {
                        workoutSessionUuid: workoutSession.uuid,
                    },
                }"
            >
                Edit
                <VIcon size="small" color="green">
                    {{ $svgIcons.workoutSession }}
                </VIcon>
            </VBtn>
            <VBtn
                v-if="workoutSession.workoutProgramRoutine"
                elevation="1"
                size="small"
                :to="{
                    name: 'NewSessionOverviewPage',
                    params: {
                        originRoutineUuid:
                            workoutSession.workoutProgramRoutine.uuid,
                    },
                }"
            >
                Repeat
                <VIcon size="small" color="green">
                    {{ $svgIcons.repeat }}
                </VIcon>
            </VBtn>
            <VBtn
                v-if="isStandAloneCheckInFromToday"
                elevation="1"
                size="small"
                :to="{
                    name: 'NewSessionRoutineSelectPage',
                }"
            >
                Add session
                <VIcon size="small" color="green">
                    {{ $svgIcons.mdiPlay }}
                </VIcon>
            </VBtn>
            <VBtn
                v-if="
                    workoutSession.workoutProgramRoutine &&
                    workoutSession.workoutProgramRoutine.workoutProgram
                "
                elevation="1"
                size="small"
                :to="{
                    name: 'ProgramBuilderPage',
                    params: {
                        workoutProgramUuid:
                            workoutSession.workoutProgramRoutine.workoutProgram
                                .uuid,
                    },
                    query:
                        $route.name === 'MyWorkoutProgramsPage'
                            ? undefined
                            : {
                                  returnTo: $route.path,
                              },
                }"
            >
                Program
                <VIcon size="small" color="primary">
                    {{ $svgIcons.workoutProgram }}
                </VIcon>
            </VBtn>
        </VCardActions>
    </VCard>
</template>
<script>
import { dateDescription } from '../../../dates';
import { differenceInSeconds, isToday, parseISO } from 'date-fns';
import CheckInFieldsDisplay from '../workoutSessions/CheckInFieldsDisplay';

export default {
    components: { CheckInFieldsDisplay },
    props: {
        linkTitle: Boolean,
        workoutSession: {
            type: Object,
            required: true,
        },
    },
    computed: {
        date() {
            return dateDescription(
                this.workoutSession.startedAt || this.workoutSession.createdAt,
            );
        },
        isStandAloneCheckInFromToday() {
            // Only allowing for today keeps things simple.
            // New workout sessions are automatically linked to any stand-alone check in
            // for the current day.
            if (!this.workoutSession.createdAt) {
                return false;
            }
            return (
                isToday(parseISO(this.workoutSession.createdAt)) &&
                (this.workoutSession.sessionExercises || []).length === 0
            );
        },
        timeStats() {
            if (!this.workoutSession.startedAt) {
                return {
                    total: 0,
                    working: 0,
                    nonWorking: 0,
                    warmUp: 0,
                    rest: 0,
                };
            }

            let total;
            if (this.workoutSession.endedAt) {
                total = differenceInSeconds(
                    new Date(this.workoutSession.endedAt),
                    new Date(this.workoutSession.startedAt),
                );
            } else {
                // For ongoing workouts, calculate from start to now
                total = differenceInSeconds(
                    new Date(), // Current local time
                    new Date(this.workoutSession.startedAt),
                );
            }

            // Ensure we never have negative duration
            total = Math.max(0, total);

            let rest = 0;
            let warmUp = 0;

            (this.workoutSession.sessionExercises || []).forEach((exercise) => {
                warmUp +=
                    exercise.warmUpEndedAt && exercise.warmUpStartedAt
                        ? differenceInSeconds(
                              new Date(exercise.warmUpEndedAt),
                              new Date(exercise.warmUpStartedAt),
                          )
                        : 0;

                exercise.sessionSets.forEach((set) => {
                    rest +=
                        set.restPeriodStartedAt && set.restPeriodEndedAt
                            ? differenceInSeconds(
                                  new Date(set.restPeriodEndedAt),
                                  new Date(set.restPeriodStartedAt),
                              )
                            : 0;
                });
            });

            const nonWorking = rest + warmUp;
            const working = nonWorking >= total ? 0 : total - nonWorking;

            return { total, working, nonWorking, warmUp, rest };
        },
    },
};
</script>
