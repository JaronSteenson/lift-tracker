<?php
declare(strict_types=1);

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Webpatser\Uuid\Uuid;

class MakeExerciseUserIdNullableAndSeed extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     * @throws Exception
     */
    public function up()
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->integer('user_id')->nullable()->change();
        });

        $exerciseNames = [
            /* push */
            'BB bench press',
            'DB should press',
            'Body-weight chest dips',
            'Incline DB flies',

            /* pull */
            'Weighted chin ups',
            'Body-weight pull ups',
            'Cable rows',
            'Cable lateral raises',

            /* legs */
            'Single-leg leg press',
            'DB reverse lunges',
            'Weighted hyper extensions',
            'Cable crunches',
        ];

        $this->insertExercises($exerciseNames);
    }

    /**
     * @param string[] $exerciseNames
     * @throws Exception
     */
    private function insertExercises(array $exerciseNames): void
    {
        foreach ($exerciseNames as $exerciseName) {
            $this->insertExercise($exerciseName);
        }
    }

    /**
     * @param string $name
     * @throws Exception
     */
    private function insertExercise(string $name): void
    {
        DB::table('exercises')->insert([
            'id' => (string) Uuid::generate(4),
            'name' => $name,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::table('exercises')->truncate();

        Schema::table('exercises', function (Blueprint $table) {
            $table->integer('user_id')->nullable(false)->change();
        });
    }
}
