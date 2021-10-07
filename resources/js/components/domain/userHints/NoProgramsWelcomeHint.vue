<template>
    <div class="mt-10 text-center">
        <h1>Welcome</h1>
        <p>
            To get started build a workout program.
        </p>
        <VBtn color="primary" :to="{ name: 'newProgramBuilder' }">
            Build new program
        </VBtn>
    </div>
</template>
