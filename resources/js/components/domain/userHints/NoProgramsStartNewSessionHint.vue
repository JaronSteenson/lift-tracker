<template>
    <div class="mt-10 text-center">
        <p>
            You need to build your a workout program before you can start a
            session.
        </p>
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
