<?php

namespace LiftTracker;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;

/**
 * Class User
 * @package LiftTracker
 *
 * @property int id
 * @property int|null $facebookId The app scoped facebook user id.
 * @property string|null $firstName
 * @property string|null $lastName
 * @property string|null $email
 * @property string|null $facebookAccessToken Long lived facebook access token, used to request data on behalf of the user.
 * @mixin Builder
 */
class User extends AbstractModel implements AuthenticatableContract
{
    use Authenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'firstName',
        'lastName',
        'email',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $visible = [
        'firstName',
        'lastName',
        'email',
    ];

    /**
     * Get the workout out programs created and owned by this user.
     * These concepts are likely to be separated in the future.
     */
    public function workoutPrograms(): HasMany
    {
        return $this->hasMany(WorkoutProgram::class, 'userId');
    }

    public function workoutSessions(): HasMany
    {
        return $this->hasMany(WorkoutSession::class, 'userId');
    }

    /**
     * @param int|null $page
     * @return WorkoutSession[]
     */
    public function getWorkoutSessionsPaginated(int $page = null): array
    {
        return $this->workoutSessions()
            ->with('workoutProgramRoutine.workoutProgram')
            ->without('sessionExercises', 'sessionExercises.sessionSets')
            ->orderBy('createdAt', 'desc')
            ->simplePaginate(null, ['*'], 'page', $page)
            ->items();
    }

    /**
     * @return Collection|WorkoutProgram[]
     */
    public function getWorkoutPrograms(): Collection
    {
        return $this->workoutPrograms()
            ->orderBy('name')
            ->orderBy('createdAt', 'desc')
            ->get();
    }

    public function findWorkoutPrograms(): Collection
    {
        return $this->workoutPrograms()->orderBy('name')->get();
    }

    public function findByFacebookId(int $facebookId): ?self
    {
        return $this->where('facebookId', $facebookId)->first();
    }

    public function isLinkedToFacebook(): bool
    {
        return $this->facebookId !== null;
    }

    public function isLoggedInWithWithFacebook(): bool
    {
        return $this->facebookAccessToken !== null;
    }

    public function setNewFacebookLink(
        int $facebookId,
        ?string $firstName,
        ?string $lastName,
        ?string $email,
        string $facebookAccessToken
    ): self {
        $this->ensureEligibleForNewFacebookLink();

        $this->facebookId = $facebookId;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->email = $email;
        $this->facebookAccessToken = $facebookAccessToken;

        return $this;
    }

    public function updateFacebookLink(
        ?string $firstName,
        ?string $lastName,
        ?string $email,
        string $facebookAccessToken
    ): self {
        $this->ensureEligibleForFacebookLinkUpdate();

        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->email = $email;
        $this->facebookAccessToken = $facebookAccessToken;

        return $this;
    }

    private function ensureEligibleForNewFacebookLink(): void
    {
        if ($this->exists) {
            throw new \InvalidArgumentException(
                'Only new users can have a new Facebook link'
            );
        }
    }

    private function ensureEligibleForFacebookLinkUpdate(): void
    {
        if (!$this->exists()) {
            throw new \InvalidArgumentException(
                'Only existing users can have their Facebook link updated'
            );
        }

        if (!$this->isLinkedToFacebook()) {
            throw new \InvalidArgumentException(
                'Only users already linked to Facebook can have their facebook link updated'
            );
        }
    }

}
