import { computed, onBeforeUnmount, ref, toValue, watch } from 'vue';
import {
    STATUS_SAVE_ERROR,
    STATUS_SAVE_IN_PROGRESS,
    STATUS_SAVE_OK,
} from '../ServerSyncInfo';

export function useServerSyncInfoState(
    entity,
    mutationState = {},
    { minimumSavingMs = 500 } = {},
) {
    const status = ref(STATUS_SAVE_OK);
    const savingStartedAt = ref(null);
    let pendingStatusTimeout = null;

    const updatedAt = computed(() => toValue(entity)?.updatedAt ?? null);

    function clearPendingTimeout() {
        if (pendingStatusTimeout) {
            window.clearTimeout(pendingStatusTimeout);
            pendingStatusTimeout = null;
        }
    }

    function finishSavingWhenAllowed() {
        clearPendingTimeout();

        if (toValue(mutationState.isPending)) {
            return;
        }

        if (toValue(mutationState.isError)) {
            savingStartedAt.value = null;
            status.value = STATUS_SAVE_ERROR;
            return;
        }

        if (!savingStartedAt.value) {
            status.value = STATUS_SAVE_OK;
            return;
        }

        const elapsedMs = Date.now() - savingStartedAt.value;
        const remainingMs = minimumSavingMs - elapsedMs;

        if (remainingMs > 0) {
            pendingStatusTimeout = window.setTimeout(() => {
                savingStartedAt.value = null;
                status.value = STATUS_SAVE_OK;
                pendingStatusTimeout = null;
            }, remainingMs);
            return;
        }

        savingStartedAt.value = null;
        status.value = STATUS_SAVE_OK;
    }

    watch(
        () => toValue(mutationState.submittedAt),
        (submittedAt, previousSubmittedAt) => {
            if (!submittedAt || submittedAt === previousSubmittedAt) {
                return;
            }

            clearPendingTimeout();
            savingStartedAt.value = Date.now();
            status.value = STATUS_SAVE_IN_PROGRESS;
            finishSavingWhenAllowed();
        },
        { immediate: true },
    );

    watch(
        () => [
            toValue(mutationState.isPending),
            toValue(mutationState.isError),
        ],
        ([isPending, isError]) => {
            if (isError) {
                clearPendingTimeout();
                savingStartedAt.value = null;
                status.value = STATUS_SAVE_ERROR;
                return;
            }

            if (isPending) {
                if (!savingStartedAt.value) {
                    savingStartedAt.value = Date.now();
                }

                clearPendingTimeout();
                status.value = STATUS_SAVE_IN_PROGRESS;
                return;
            }

            finishSavingWhenAllowed();
        },
        { immediate: true },
    );

    onBeforeUnmount(() => {
        clearPendingTimeout();
    });

    return {
        status: computed(() => status.value),
        updatedAt,
    };
}
