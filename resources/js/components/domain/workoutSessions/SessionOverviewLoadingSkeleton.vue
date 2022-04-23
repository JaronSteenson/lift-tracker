<template>
    <div>
        <VToolbar>
            <VSkeletonLoader type="heading" class="heading-bone" />
        </VToolbar>
        <VSheet class="mx-3">
            <VRow>
                <VCol cols="12" lg="3" md="4" sm="6">
                    <VCard>
                        <VSkeletonLoader type="heading" style="margin: 20px" />
                        <VSkeletonLoader
                            type="image"
                            class="exercise-card-bone"
                        />
                        <VSkeletonLoader
                            type="image"
                            class="exercise-card-bone"
                        />
                        <VSkeletonLoader
                            type="image"
                            class="add-exercise-button-bone"
                        />
                    </VCard>
                </VCol>
                <VCol cols="12" lg="3" md="4" sm="6">
                    <VCard>
                        <VSkeletonLoader type="heading" style="margin: 20px" />
                        <VSkeletonLoader
                            type="image"
                            class="exercise-card-bone"
                        />
                        <VSkeletonLoader
                            type="image"
                            class="exercise-card-bone"
                        />
                        <VSkeletonLoader
                            type="image"
                            class="exercise-card-bone"
                        />
                        <VSkeletonLoader
                            type="image"
                            class="exercise-card-bone"
                        />
                        <VSkeletonLoader
                            type="image"
                            class="add-exercise-button-bone"
                        />
                    </VCard>
                </VCol>
                <VCol cols="12" lg="3" md="4" sm="6">
                    <VCard>
                        <VSkeletonLoader type="heading" style="margin: 20px" />
                        <VSkeletonLoader
                            type="image"
                            class="exercise-card-bone"
                        />
                        <VSkeletonLoader
                            type="image"
                            class="exercise-card-bone"
                        />
                        <VSkeletonLoader
                            type="image"
                            class="exercise-card-bone"
                        />
                        <VSkeletonLoader
                            type="image"
                            class="add-exercise-button-bone"
                        />
                    </VCard>
                </VCol>
                <VCol cols="12" lg="3" md="4" slot="footer" sm="6">
                    <VSkeletonLoader
                        type="image"
                        class="add-workout-button-bone"
                    />
                </VCol>
            </VRow>
        </VSheet>
    </div>
</template>

<style lang="scss">
.heading-bone {
    width: 600px;
}

.exercise-card-bone {
    height: 100px;
    margin: 10px;
}

.add-exercise-button-bone {
    height: 50px;
    margin: 10px;
}

.add-workout-button-bone {
    height: 40px;
}
</style>
