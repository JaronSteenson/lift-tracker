<template>
    <ListPage title="My workout programs">
        <slot>
            <WorkoutProgramList/>
        </slot>
        <template v-slot:fab>
            <VBtn
                :to="{ name: 'newProgramBuilder' }"
                fab
                fixed
                right
                bottom
            >
                <VIcon color="primary">{{ $svgIcons.mdiPlus }}</VIcon>
            </VBtn>
        </template>
    </ListPage>
</template>

<script>
import WorkoutProgramList from '../domain/WorkoutProgramList';
import ListPage from '../layouts/ListPage';

export default {
    components: {
        ListPage,
        WorkoutProgramList,
    },
}
</script>
