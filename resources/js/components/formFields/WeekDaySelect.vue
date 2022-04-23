<template>
    <select
        v-bind:id="selectId"
        class="form-control"
        @input="updateSelectedValue($event.target.value)"
    >
        <option
            v-for="option in daysOfWeekWithAny"
            :key="option"
            :value="option"
        >
            {{ option }}
        </option>
    </select>
</template>

<script>
export default {
    name: 'WeekDaySelect',
    props: {
        selectId: {
            type: String,
            required: true,
        },
        initialSelection: {
            default() {
                return 'any';
            },
        },
    },
    data() {
        return {
            daysOfWeekWithAny: [
                'any',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ],
            value: { ...this.initialSelection },
        };
    },
    methods: {
        updateSelectedValue(selectedValue) {
            this.value = selectedValue;
            this.$emit('input', selectedValue);
        },
    },
};
</script>
