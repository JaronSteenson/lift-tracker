<template>
    <ListPage title="Choose a routine to start">
        <slot>
            <StartRoutineSelectionList/>
        </slot>
    </ListPage>
</template>

<script>
import ListPage from '../layouts/ListPage';
import StartRoutineSelectionList from '../domain/StartRoutineSelectionList';

export default {
    components: {
        ListPage,
        StartRoutineSelectionList,
    },
}
</script>
