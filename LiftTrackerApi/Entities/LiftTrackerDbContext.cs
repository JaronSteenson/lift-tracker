using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Entities;

public partial class LiftTrackerDbContext : DbContext
{
    private readonly IConfiguration _config;

    public LiftTrackerDbContext(DbContextOptions<LiftTrackerDbContext> options, IConfiguration config)
        : base(options)
    {
        _config = config;
    }

    public virtual DbSet<Exercise> Exercises { get; set; }

    public virtual DbSet<Migration> Migrations { get; set; }

    public virtual DbSet<PasswordReset> PasswordResets { get; set; }

    public virtual DbSet<RoutineExercise> RoutineExercises { get; set; }

    public virtual DbSet<SessionExercise> SessionExercises { get; set; }

    public virtual DbSet<SessionSet> SessionSets { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<WorkoutProgram> WorkoutPrograms { get; set; }

    public virtual DbSet<WorkoutProgramRoutine> WorkoutProgramRoutines { get; set; }

    public virtual DbSet<WorkoutSession> WorkoutSessions { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseMySQL(
            _config.GetConnectionString("LiftTrackerDatabase") ??
            throw new InvalidOperationException("LiftTrackerDatabase connection string is not configured.")
        );
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasNoKey();

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("createdAt");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("updatedAt");
            entity.Property(e => e.UserId).HasColumnName("userId");
        });

        modelBuilder.Entity<Migration>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("migrations");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Batch).HasColumnName("batch");
            entity.Property(e => e.Migration1)
                .HasMaxLength(255)
                .HasColumnName("migration");
        });

        modelBuilder.Entity<PasswordReset>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("password_resets");

            entity.HasIndex(e => e.Email, "password_resets_email_index");

            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.Token)
                .HasMaxLength(255)
                .HasColumnName("token");
        });

        modelBuilder.Entity<RoutineExercise>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.WorkoutProgramRoutineId, "RoutineExercises_ibfk_1");

            entity.HasIndex(e => e.Uuid, "idx_uuid").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("timestamp")
                .HasColumnName("deletedAt");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.NumberOfSets).HasColumnName("numberOfSets");
            entity.Property(e => e.Position).HasColumnName("position");
            entity.Property(e => e.RestPeriod).HasColumnName("restPeriod");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("updatedAt");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
            entity.Property(e => e.WarmUp).HasColumnName("warmUp");
            entity.Property(e => e.Weight)
                .HasPrecision(6)
                .HasColumnName("weight");
            entity.Property(e => e.WorkoutProgramRoutineId).HasColumnName("workoutProgramRoutineId");

            entity.HasOne(d => d.WorkoutProgramRoutine).WithMany(p => p.RoutineExercises)
                .HasForeignKey(d => d.WorkoutProgramRoutineId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("RoutineExercises_ibfk_1");
        });

        modelBuilder.Entity<SessionExercise>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.RoutineExerciseId, "sessionexercises_routineexerciseid_index");

            entity.HasIndex(e => e.Uuid, "sessionexercises_uuid_index");

            entity.HasIndex(e => e.WorkoutSessionId, "sessionexercises_workoutsessionid_foreign");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("timestamp")
                .HasColumnName("deletedAt");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsFixedLength()
                .HasColumnName("name");
            entity.Property(e => e.Notes)
                .HasColumnType("text")
                .HasColumnName("notes");
            entity.Property(e => e.PlannedRestPeriodDuration).HasColumnName("plannedRestPeriodDuration");
            entity.Property(e => e.PlannedWarmUp).HasColumnName("plannedWarmUp");
            entity.Property(e => e.PlannedWeight)
                .HasPrecision(6)
                .HasColumnName("plannedWeight");
            entity.Property(e => e.Position).HasColumnName("position");
            entity.Property(e => e.RoutineExerciseId).HasColumnName("routineExerciseId");
            entity.Property(e => e.Skipped).HasColumnName("skipped");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("updatedAt");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
            entity.Property(e => e.WarmUpDuration).HasColumnName("warmUpDuration");
            entity.Property(e => e.WarmUpEndedAt)
                .HasColumnType("timestamp")
                .HasColumnName("warmUpEndedAt");
            entity.Property(e => e.WarmUpStartedAt)
                .HasColumnType("timestamp")
                .HasColumnName("warmUpStartedAt");
            entity.Property(e => e.WorkoutSessionId).HasColumnName("workoutSessionId");

            entity.HasOne(d => d.WorkoutSession).WithMany(p => p.SessionExercises)
                .HasForeignKey(d => d.WorkoutSessionId)
                .HasConstraintName("sessionexercises_workoutsessionid_foreign");
        });

        modelBuilder.Entity<SessionSet>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.SessionExerciseId, "sessionsets_sessionexerciseid_foreign");

            entity.HasIndex(e => e.Uuid, "sessionsets_uuid_index");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("timestamp")
                .HasColumnName("deletedAt");
            entity.Property(e => e.EndedAt)
                .HasColumnType("timestamp")
                .HasColumnName("endedAt");
            entity.Property(e => e.Position).HasColumnName("position");
            entity.Property(e => e.Reps)
                .HasColumnType("decimal(6,2) unsigned")
                .HasColumnName("reps");
            entity.Property(e => e.RestPeriodDuration).HasColumnName("restPeriodDuration");
            entity.Property(e => e.RestPeriodEndedAt)
                .HasColumnType("timestamp")
                .HasColumnName("restPeriodEndedAt");
            entity.Property(e => e.RestPeriodStartedAt)
                .HasColumnType("timestamp")
                .HasColumnName("restPeriodStartedAt");
            entity.Property(e => e.SessionExerciseId).HasColumnName("sessionExerciseId");
            entity.Property(e => e.StartedAt)
                .HasColumnType("timestamp")
                .HasColumnName("startedAt");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("updatedAt");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
            entity.Property(e => e.WarmUpDuration).HasColumnName("warmUpDuration");
            entity.Property(e => e.WarmUpEndedAt)
                .HasColumnType("timestamp")
                .HasColumnName("warmUpEndedAt");
            entity.Property(e => e.WarmUpStartedAt)
                .HasColumnType("timestamp")
                .HasColumnName("warmUpStartedAt");
            entity.Property(e => e.Weight)
                .HasPrecision(6)
                .HasColumnName("weight");

            entity.HasOne(d => d.SessionExercise).WithMany(p => p.SessionSets)
                .HasForeignKey(d => d.SessionExerciseId)
                .HasConstraintName("sessionsets_sessionexerciseid_foreign");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.Email, "email").IsUnique();

            entity.HasIndex(e => e.Email, "email_2").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("createdAt");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.EmailVerifiedAt)
                .HasColumnType("timestamp")
                .HasColumnName("emailVerifiedAt");
            entity.Property(e => e.FirstName)
                .HasMaxLength(255)
                .HasColumnName("firstName");
            entity.Property(e => e.LastName)
                .HasMaxLength(255)
                .HasColumnName("lastName");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.RememberToken)
                .HasMaxLength(100)
                .HasColumnName("rememberToken");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<WorkoutProgram>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.Uuid, "idx_uuid").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("timestamp")
                .HasColumnName("deletedAt");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("updatedAt");
            entity.Property(e => e.UserId).HasColumnName("userId");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
        });

        modelBuilder.Entity<WorkoutProgramRoutine>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.WorkoutProgramId, "WorkoutProgramRoutines_ibfk_1");

            entity.HasIndex(e => e.Uuid, "idx_uuid").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("timestamp")
                .HasColumnName("deletedAt");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.NormalDay)
                .HasDefaultValueSql("'any'")
                .HasColumnType("enum('any','Monday','Tuesday','Wensday','Thursday','Friday','Saturday','Sunday')")
                .HasColumnName("normalDay");
            entity.Property(e => e.Position).HasColumnName("position");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("updatedAt");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
            entity.Property(e => e.WorkoutProgramId).HasColumnName("workoutProgramId");

            entity.HasOne(d => d.WorkoutProgram).WithMany(p => p.WorkoutProgramRoutines)
                .HasForeignKey(d => d.WorkoutProgramId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("WorkoutProgramRoutines_ibfk_1");
        });

        modelBuilder.Entity<WorkoutSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.CreatedAt, "workoutsessions_createdat_index");

            entity.HasIndex(e => e.UserId, "workoutsessions_userid_index");

            entity.HasIndex(e => e.Uuid, "workoutsessions_uuid_index");

            entity.HasIndex(e => e.WorkoutProgramRoutineId, "workoutsessions_workoutprogramroutineid_index");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BodyWeight)
                .HasPrecision(6)
                .HasColumnName("bodyWeight");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("timestamp")
                .HasColumnName("deletedAt");
            entity.Property(e => e.EndedAt)
                .HasColumnType("timestamp")
                .HasColumnName("endedAt");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Notes)
                .HasColumnType("text")
                .HasColumnName("notes");
            entity.Property(e => e.StartedAt)
                .HasColumnType("timestamp")
                .HasColumnName("startedAt");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasColumnName("updatedAt");
            entity.Property(e => e.UserId).HasColumnName("userId");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
            entity.Property(e => e.WorkoutProgramRoutineId).HasColumnName("workoutProgramRoutineId");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
