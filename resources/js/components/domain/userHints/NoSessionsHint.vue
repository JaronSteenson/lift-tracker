<template>
    <div class="mt-10 text-center">
        <h1>No records yet</h1>
        <p>Your check-ins and sessions will appear here.</p>
        <VBtn color="secondary" :to="{ name: 'CheckInEditPage' }">
            Records weight/notes
        </VBtn>
        <VBtn color="primary" :to="{ name: 'NewSessionRoutineSelectPage' }">
            Start a session now
        </VBtn>
    </div>
</template>
<script setup lang="ts"></script>
