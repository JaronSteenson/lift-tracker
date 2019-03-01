<?php

namespace LiftTracker\Http\Requests;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;

class WorkoutProgramRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        /** @var WorkoutProgram $workoutProgram */
        $workoutProgram = $this->getModel();

        if ($workoutProgram !== null) {
            return $workoutProgram->isOwnedBy($this->user());
        }

        return true;
    }

    private function getModel(): ?Model
    {
        $modelParameterName = Arr::first($this->route()->parameterNames());

        if ($modelParameterName !== null) {
            /** @noinspection PhpIncompatibleReturnTypeInspection */
            return $this->route()->parameter($modelParameterName);
        }

        return null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        //Do not try to validate GET and DELETE requests which should not have form data
        if ($this->isNonValidateMethod()) {
            return [];
        }

        return [
            'name'=>'required|max:40',
        ];
    }

    private function isNonValidateMethod()
    {
        return in_array($this->method(), $this->getNonValidateMethods(), true);
    }

    private function getNonValidateMethods(): array
    {
        return ['GET', 'DELETE'];
    }
}