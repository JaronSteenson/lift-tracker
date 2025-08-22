<template>
    <div class="mt-10 text-center">
        <h1>No records yet</h1>
        <p>Your check-ins and sessions will appear here.</p>
        <div class="d-flex justify-center ga-4">
            <VBtn
                elevation="1"
                color="secondary"
                :to="{ name: 'CheckInEditPage' }"
            >
                Check in
            </VBtn>
            <VBtn
                elevation="1"
                color="primary"
                :to="{ name: 'NewSessionRoutineSelectPage' }"
            >
                Start a session
            </VBtn>
        </div>
    </div>
</template>
<script setup lang="ts"></script>
