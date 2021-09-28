<?php
/** @noinspection ReturnTypeCanBeDeclaredInspection */
/** @noinspection PhpVoidFunctionResultUsedInspection */

namespace LiftTracker\Http\Controllers\Api;

use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgram;
use LiftTracker\Domain\Workouts\Programs\WorkoutProgramRoutine;
use LiftTracker\Domain\Workouts\Sessions\WorkoutSession;
use LiftTracker\Http\Controllers\Controller;
use LiftTracker\Http\Requests\WorkoutProgramRequest;
use LiftTracker\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class WorkoutRoutineController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @param WorkoutProgramRequest $request
     * @return array
     */
    public function index(WorkoutProgramRequest $request): array
    {
        /** @var User $loggedInUser */
        $loggedInUser = $request->user();

        $sql = '
            select * from (
                -- Routines that have been used.
                select r.id, r.updatedAt, ws.id mostRecentSessionId, ws.startedAt lastSessiomStartedAt
                from WorkoutSessions ws
                join (
                    select max(ws.startedAt) maxStartAt, workoutProgramRoutineId from WorkoutSessions ws
                    where ws.userId = ?
                    group by workoutProgramRoutineId
                    ) groupedWs
                on ws.startedAt = groupedWs.maxStartAt and ws.workoutProgramRoutineId = groupedWs.workoutProgramRoutineId
                join WorkoutProgramRoutines r on ws.workoutProgramRoutineId = r.id
                join WorkoutPrograms wp on wp.id = r.workoutProgramId
                where wp.userId = ? and r.deletedAt is null

                union all

                -- Unused routines.
                select r.id, r.updatedAt, null mostRecentSessionId, null lastSessiomStartedAt
                from WorkoutProgramRoutines r
                left join WorkoutSessions ws on r.id = ws.workoutProgramRoutineId
                join WorkoutPrograms wp on wp.id = r.workoutProgramId
                where wp.userId = ? and r.deletedAt is null and ws.id is null
            ) combined
            order by lastSessiomStartedAt desc, updatedAt desc;
        ';

        $userId = $request->user()->id;

        $combined_rows = DB::select($sql, [$userId, $userId, $userId]);

        $workoutRoutineIds = [];
        $mostRecentSessionIds = [];

        foreach ($combined_rows as $combined_row) {
            $workoutRoutineIds[]= $combined_row->id;
            $mostRecentSessionIds[]= $combined_row->mostRecentSessionId;
        }

        $workoutRoutines = (new WorkoutProgramRoutine())
            ->whereIn('id', $workoutRoutineIds)
            ->with('workoutProgram')
            ->get()->keyBy('id');

        $mostRecentSessions = (new WorkoutSession)->without('sessionExercises')
            ->whereIn('id', $mostRecentSessionIds)
            ->get()->keyBy('id');

        return array_map(static function (\stdClass $row) use ($workoutRoutines, $mostRecentSessions): WorkoutProgramRoutine {
            /** @var WorkoutProgramRoutine $routine */
            $routine = $workoutRoutines->get($row->id);
            $routine->latestSession = $mostRecentSessions->get($row->mostRecentSessionId);

            return $routine;
        }, $combined_rows);
    }

}
