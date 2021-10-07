<template>
    <div class="mt-10 text-center">
        <p>
            Your workout programs will appear here.
        </p>
        <VBtn color="primary" :to="{ name: 'newProgramBuilder' }">
            Build new program
        </VBtn>
    </div>
</template>
