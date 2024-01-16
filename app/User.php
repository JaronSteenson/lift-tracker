<?php

namespace LiftTracker;

use DateTimeInterface;
use Illuminate\Auth\Authenticatable as AuthenticatableTrait;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use LiftTracker\Domain\AbstractModel;
use LiftTracker\Domain\Users\Notifications\ResetPassword;
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
 * @property DateTimeInterface|null $emailVerifiedAt
 * @mixin Builder
 */
class User extends AbstractModel implements Authenticatable, MustVerifyEmail, CanResetPassword
{
    use AuthenticatableTrait {
        AuthenticatableTrait::getRememberTokenName as getRememberTokenNameOriginal;
    }
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'firstName',
        'lastName',
        'email',
        'password',
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
        'emailVerifiedAt',
    ];

    public function getRememberTokenName(): string
    {
        return 'rememberToken';
    }

    public static function findByUnverifiedEmail(string $email)
    {
        return self::where(['email' => $email])->whereNull('emailVerifiedAt')->first();
    }

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
            ->simplePaginate(50, ['*'], 'page', $page)
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

    /**
     * Determine if the user has verified their email address.
     *
     * @return bool
     * @see \Illuminate\Auth\MustVerifyEmail::hasVerifiedEmail()
     */
    public function hasVerifiedEmail(): bool
    {
        return $this->emailVerifiedAt !== null;
    }

    /**
     * Mark the given user's email as verified.
     *
     * @return bool
     * @see \Illuminate\Auth\MustVerifyEmail::markEmailAsVerified()
     */
    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'emailVerifiedAt' => $this->freshTimestamp(),
        ])->save();
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     * @see \Illuminate\Auth\MustVerifyEmail::sendEmailVerificationNotification()
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmail);
    }

    public function getEmailForPasswordReset(): ?string
    {
        return $this->email;
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPassword($token));
    }
}
