<template>
    <div class="mt-10 text-center">
        <h1>No sessions yet</h1>
        <p>
            Your workout sessions will appear here.
        </p>
        <VBtn color="primary" :to="{ name: 'NewSessionRoutineSelectPage' }">
            Start a session now
        </VBtn>
    </div>
</template>
