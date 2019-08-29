<?php

namespace LiftTracker\Http\Requests;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use LiftTracker\Domain\Users\UserOwnershipInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

abstract class ApiRequest extends FormRequest
{
    private $hasAttemptedToFindModel = false;

    /**
     * @var Model|null
     */
    private $existingModel;

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $model = null;

        if ($this->isDealingWithExistingEntityMethod()) {
            $model = $this->getModelOr404();
        }

        if ($model !== null) {
            return $this->checkModelOwnership($model);
        }

        return true;
    }

    protected function checkModelOwnership(Model $model)
    {
        if ($model instanceof UserOwnershipInterface) {
            return $model->userOwnsThis($this->user());
        }

        // No ownership checks are rehired.
        return true;
    }

    public function getExistingModel(): ?Model
    {
        if (!$this->hasAttemptedToFindModel) {
            $this->hasAttemptedToFindModel = true;
            $this->existingModel = $this->findExistingModel();
        }

        return $this->existingModel;
    }

    /**
     * @return Model
     * @throws NotFoundHttpException
     */
    public function getModelOr404(): Model
    {
        $model = $this->getExistingModel();

        if ($model === null) {
            throw new NotFoundHttpException();
        }

        return $model;
    }

    private function findExistingModel(): ?Model
    {
        $modelId = $this->getModelId();

        if ($modelId !== null) {
            $modelClass = $this->getModelClass();

            /** @var Builder $model */
            $model = new $modelClass;

            return $model->find($modelId);
        }

        return null;
    }

    protected function getModelId()
    {
        return Arr::first($this->route()->parameters());
    }

    abstract protected function getModelClass(): string;

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

        return $this->getValidationRules();
    }

    /**
     * @return array To be overridden by child classes
     */
    protected function getValidationRules(): array
    {
        return [];
    }

    private function isDealingWithExistingEntityMethod(): bool
    {
        // Are we trying to GET all of the resources.
        if ($this->isGetAllRequest()) {
            return false;
        }

        return in_array($this->method(), $this->getExistingEntityMethods(), true);
    }

    private function isGetAllRequest(): bool
    {
        return $this->method() === 'GET' && $this->getModelId() === null;
    }

    private function getExistingEntityMethods(): array
    {
        return ['GET', 'DELETE', 'PUT', 'PATCH'];
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
