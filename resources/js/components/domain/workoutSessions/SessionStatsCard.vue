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
        <VCardText>
            <CheckInFieldsDisplay :workoutSession="workoutSession" />
            <SessionStats
                v-if="workoutSession.startedAt"
                :workoutSession="workoutSession"
                :timeStats="timeStats"
            />
        </VCardText>
        <VCardActions>
            <VBtn
                small
                :to="{
                    name: 'CheckInEditPage',
                    params: {
                        workoutSessionUuid: workoutSession.uuid,
                    },
                }"
            >
                Edit
                <VIcon small color="green">
                    {{ $svgIcons.workoutSession }}
                </VIcon>
            </VBtn>
            <VBtn
                v-if="workoutSession.workoutProgramRoutine"
                small
                :to="{
                    name: 'NewSessionOverviewPage',
                    params: {
                        originRoutineUuid:
                            workoutSession.workoutProgramRoutine.uuid,
                    },
                }"
            >
                Repeat
                <VIcon small color="green">
                    {{ $svgIcons.repeat }}
                </VIcon>
            </VBtn>
            <VBtn
                v-if="
                    workoutSession.workoutProgramRoutine &&
                    workoutSession.workoutProgramRoutine.workoutProgram
                "
                small
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
                <VIcon small color="primary">
                    {{ $svgIcons.workoutProgram }}
                </VIcon>
            </VBtn>
        </VCardActions>
    </VCard>
</template>
<script>
import { dateDescription, utcNow } from '../../../dates';
import { differenceInSeconds } from 'date-fns';
import SessionStats from '../workoutSessions/SessionStats';
import CheckInFieldsDisplay from '../workoutSessions/CheckInFieldsDisplay';

export default {
    components: { SessionStats, CheckInFieldsDisplay },
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
                this.workoutSession.startedAt || this.workoutSession.createdAt
            );
        },
        timeStats() {
            const total = differenceInSeconds(
                new Date(this.workoutSession.endedAt || utcNow()),
                new Date(this.workoutSession.startedAt)
            );

            let rest = 0;
            let warmUp = 0;

            this.workoutSession.sessionExercises.forEach((exercise) => {
                warmUp +=
                    exercise.warmUpEndedAt && exercise.warmUpStartedAt
                        ? differenceInSeconds(
                              new Date(exercise.warmUpEndedAt),
                              new Date(exercise.warmUpStartedAt)
                          )
                        : 0;

                exercise.sessionSets.forEach((set) => {
                    rest +=
                        set.restPeriodStartedAt && set.restPeriodEndedAt
                            ? differenceInSeconds(
                                  new Date(set.restPeriodEndedAt),
                                  new Date(set.restPeriodStartedAt)
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
