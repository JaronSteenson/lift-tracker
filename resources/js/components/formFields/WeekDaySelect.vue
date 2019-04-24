<template>
    <select v-bind:id="selectId" class="form-control" @input="updateSelectedValue($event.target.value)">
        <option v-for="option in daysOfWeekWithAny" v-bind:value="option">
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
            }
        },
        methods: {
            updateSelectedValue(selectedValue) {
                this.$emit('input', selectedValue);
            }
        }
    }
</script>