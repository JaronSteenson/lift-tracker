<template>
    <div class="mt-10 text-center">
        <p>Your workout programs will appear here.</p>
        <VBtn
            elevation="1"
            color="primary"
            variant="elevated"
            :to="{ name: 'ProgramBuilderPageNew' }"
        >
            Build new program
        </VBtn>
    </div>
</template>
