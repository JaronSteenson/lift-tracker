using System.Linq.Expressions;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace LiftTrackerApi.Entities;

public partial class LiftTrackerDbContext(
    DbContextOptions<LiftTrackerDbContext> options,
    IConfiguration config
) : DbContext(options)
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new();

    public virtual DbSet<RoutineExercise> RoutineExercises { get; set; }

    public virtual DbSet<SessionExercise> SessionExercises { get; set; }

    public virtual DbSet<SessionSet> SessionSets { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<WorkoutProgram> WorkoutPrograms { get; set; }

    public virtual DbSet<WorkoutProgramRoutine> WorkoutProgramRoutines { get; set; }

    public virtual DbSet<WorkoutSession> WorkoutSessions { get; set; }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseMySQL(
            config.GetConnectionString("LiftTrackerDatabase")
                ?? throw new InvalidOperationException(
                    "LiftTrackerDatabase connection string is not configured."
                )
        );
        optionsBuilder.EnableSensitiveDataLogging();
    }

    private void UpdateTimestamps()
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is not DomainEntity entity)
            {
                continue;
            }

            switch (entry.State)
            {
                case EntityState.Added:
                    // Allow tests and the front-end to set CreatedAt to a specific time.
                    if (entity.CreatedAt == null || entity.CreatedAt >= now)
                    {
                        entity.CreatedAt = now;
                        entity.UpdatedAt = now;
                    }

                    break;
                case EntityState.Modified:
                    entity.UpdatedAt = now;
                    break;
                case EntityState.Deleted:
                    entity.DeletedAt = now;

                    // Soft delete instead of hard delete
                    entry.State = EntityState.Modified;
                    break;
            }
        }
    }

    private void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        FilterSoftDeletedEntities(modelBuilder);
    }

    private void FilterSoftDeletedEntities(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var clrType = entityType.ClrType;
            if (!clrType.IsAssignableTo(typeof(DomainEntity)))
            {
                continue;
            }

            var parameter = Expression.Parameter(clrType, "e");

            var deletedAtProperty = Expression.Property(
                Expression.Convert(parameter, typeof(DomainEntity)),
                nameof(DomainEntity.DeletedAt)
            );

            var nullConstant = Expression.Constant(null, typeof(DateTime?));
            var body = Expression.Equal(deletedAtProperty, nullConstant);
            var lambda = Expression.Lambda(body, parameter);

            modelBuilder.Entity(clrType).HasQueryFilter(lambda);
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var progressionSchemeSettingsComparer =
            new ValueComparer<ProgressionScheme531Settings?>(
                (left, right) =>
                    JsonSerializer.Serialize(left, JsonSerializerOptions)
                    == JsonSerializer.Serialize(right, JsonSerializerOptions),
                settings => JsonSerializer.Serialize(settings, JsonSerializerOptions).GetHashCode(),
                settings =>
                    JsonSerializer.Deserialize<ProgressionScheme531Settings>(
                        JsonSerializer.Serialize(settings, JsonSerializerOptions),
                        JsonSerializerOptions
                    )
            );

        modelBuilder.Entity<RoutineExercise>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.WorkoutProgramRoutineId, "RoutineExercises_ibfk_1");

            entity.HasIndex(e => e.Uuid, "idx_uuid").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp").HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt).HasColumnType("timestamp").HasColumnName("deletedAt");
            entity.Property(e => e.Name).HasMaxLength(255).HasColumnName("name");
            entity.Property(e => e.NumberOfSets).HasColumnName("numberOfSets");
            entity.Property(e => e.Position).HasColumnName("position");
            entity.Property(e => e.ProgressionScheme).HasColumnName("progressionScheme");
            entity
                .Property(e => e.ProgressionSchemeSettings)
                .HasColumnType("json")
                .HasColumnName("progressionSchemeSettings")
                .HasConversion(
                    value => JsonSerializer.Serialize(value, JsonSerializerOptions),
                    value =>
                        string.IsNullOrWhiteSpace(value)
                            ? null
                            : JsonSerializer.Deserialize<ProgressionScheme531Settings>(
                                value,
                                JsonSerializerOptions
                            )
                )
                .Metadata.SetValueComparer(progressionSchemeSettingsComparer);
            entity.Property(e => e.Rpe).HasColumnName("rpe");
            entity.Property(e => e.RestPeriod).HasColumnName("restPeriod");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp").HasColumnName("updatedAt");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
            entity.Property(e => e.WarmUp).HasColumnName("warmUp");
            entity.Property(e => e.Weight).HasPrecision(6).HasColumnName("weight");
            entity
                .Property(e => e.WorkoutProgramRoutineId)
                .HasColumnName("workoutProgramRoutineId");

            entity
                .HasOne(d => d.WorkoutProgramRoutine)
                .WithMany(p => p.RoutineExercises)
                .HasForeignKey(d => d.WorkoutProgramRoutineId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("RoutineExercises_ibfk_1");
        });

        modelBuilder.Entity<SessionExercise>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            // For searching history.
            entity
                .HasIndex("RoutineExerciseId", nameof(SessionExercise.CreatedAt))
                .HasDatabaseName("sessionexercises_routineexerciseid_createdat_index")
                .IsUnique(false);

            // For foreign key.
            entity
                .HasIndex("RoutineExerciseId")
                .HasDatabaseName("sessionexercises_routineexerciseid_index")
                .IsUnique(false);

            entity.HasIndex(e => e.Uuid, "sessionexercises_uuid_index");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp").HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt).HasColumnType("timestamp").HasColumnName("deletedAt");
            entity.Property(e => e.Name).HasMaxLength(100).IsFixedLength().HasColumnName("name");
            entity.Property(e => e.Notes).HasColumnType("text").HasColumnName("notes");
            entity.Property(e => e.ProgressionScheme).HasColumnName("progressionScheme");
            entity.Property(e => e.PlannedRpe).HasColumnName("plannedRpe");
            entity
                .Property(e => e.PlannedRestPeriodDuration)
                .HasColumnName("plannedRestPeriodDuration");
            entity.Property(e => e.PlannedWarmUp).HasColumnName("plannedWarmUp");
            entity.Property(e => e.PlannedWeight).HasPrecision(6).HasColumnName("plannedWeight");
            entity.Property(e => e.Position).HasColumnName("position");
            entity.Property(e => e.Skipped).HasColumnName("skipped");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp").HasColumnName("updatedAt");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
            entity.Property(e => e.WarmUpDuration).HasColumnName("warmUpDuration");
            entity
                .Property(e => e.WarmUpEndedAt)
                .HasColumnType("timestamp")
                .HasColumnName("warmUpEndedAt");
            entity
                .Property(e => e.WarmUpStartedAt)
                .HasColumnType("timestamp")
                .HasColumnName("warmUpStartedAt");

            entity
                .HasOne(d => d.RoutineExercise)
                .WithMany()
                .HasForeignKey("RoutineExerciseId");

            entity
                .HasOne(d => d.WorkoutSession)
                .WithMany(p => p.SessionExercises)
                .HasForeignKey("WorkoutSessionId")
                .HasConstraintName("sessionexercises_workoutsessionid_foreign");
        });

        modelBuilder.Entity<SessionSet>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.SessionExerciseId, "sessionsets_sessionexerciseid_foreign");

            entity.HasIndex(e => e.Uuid, "sessionsets_uuid_index");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp").HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt).HasColumnType("timestamp").HasColumnName("deletedAt");
            entity.Property(e => e.EndedAt).HasColumnType("timestamp").HasColumnName("endedAt");
            entity.Property(e => e.Position).HasColumnName("position");
            entity
                .Property(e => e.Reps)
                .HasColumnType("decimal(6,2) unsigned")
                .HasColumnName("reps");
            entity.Property(e => e.Rpe).HasColumnName("rpe");
            entity.Property(e => e.RestPeriodDuration).HasColumnName("restPeriodDuration");
            entity
                .Property(e => e.RestPeriodEndedAt)
                .HasColumnType("timestamp")
                .HasColumnName("restPeriodEndedAt");
            entity
                .Property(e => e.RestPeriodStartedAt)
                .HasColumnType("timestamp")
                .HasColumnName("restPeriodStartedAt");
            entity.Property(e => e.SessionExerciseId).HasColumnName("sessionExerciseId");
            entity.Property(e => e.StartedAt).HasColumnType("timestamp").HasColumnName("startedAt");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp").HasColumnName("updatedAt");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
            entity.Property(e => e.WarmUpDuration).HasColumnName("warmUpDuration");
            entity
                .Property(e => e.WarmUpEndedAt)
                .HasColumnType("timestamp")
                .HasColumnName("warmUpEndedAt");
            entity
                .Property(e => e.WarmUpStartedAt)
                .HasColumnType("timestamp")
                .HasColumnName("warmUpStartedAt");
            entity.Property(e => e.Weight).HasPrecision(6).HasColumnName("weight");

            entity
                .HasOne(d => d.SessionExercise)
                .WithMany(p => p.SessionSets)
                .HasForeignKey(d => d.SessionExerciseId)
                .HasConstraintName("sessionsets_sessionexerciseid_foreign");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
            entity.HasIndex(e => e.Uuid, "idx_uuid").IsUnique();
            entity.HasIndex(e => e.Email, "email").IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp").HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt).HasColumnType("timestamp").HasColumnName("deletedAt");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp").HasColumnName("updatedAt");
        });

        modelBuilder.Entity<WorkoutProgram>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.Uuid, "idx_uuid").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp").HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt).HasColumnType("timestamp").HasColumnName("deletedAt");
            entity.Property(e => e.Name).HasMaxLength(255).HasColumnName("name");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp").HasColumnName("updatedAt");
            entity.Property(e => e.UserId).HasColumnName("userId");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
        });

        modelBuilder.Entity<WorkoutProgramRoutine>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.WorkoutProgramId, "WorkoutProgramRoutines_ibfk_1");

            entity.HasIndex(e => e.Uuid, "idx_uuid").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp").HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt).HasColumnType("timestamp").HasColumnName("deletedAt");
            entity.Property(e => e.Name).HasMaxLength(255).HasColumnName("name");
            entity
                .Property(e => e.NormalDay)
                .HasDefaultValueSql("'any'")
                .HasColumnType(
                    "enum('any','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')"
                )
                .HasColumnName("normalDay");
            entity.Property(e => e.Position).HasColumnName("position");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp").HasColumnName("updatedAt");
            entity.Property(e => e.Uuid).HasColumnName("uuid");
            entity.Property(e => e.WorkoutProgramId).HasColumnName("workoutProgramId");

            entity
                .HasOne(d => d.WorkoutProgram)
                .WithMany(p => p.WorkoutProgramRoutines)
                .HasForeignKey(d => d.WorkoutProgramId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("WorkoutProgramRoutines_ibfk_1");
        });

        modelBuilder.Entity<WorkoutSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");
            entity
                .HasIndex(w => new { w.UserId, w.CreatedAt })
                .HasDatabaseName("workoutsessions_userid_createdat_uuid_index")
                .IsUnique(false);
            entity.HasIndex(e => e.Uuid, "workoutsessions_uuid_index");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BodyWeight).HasPrecision(6).HasColumnName("bodyWeight");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp").HasColumnName("createdAt");
            entity.Property(e => e.DeletedAt).HasColumnType("timestamp").HasColumnName("deletedAt");
            entity.Property(e => e.EndedAt).HasColumnType("timestamp").HasColumnName("endedAt");
            entity.Property(e => e.Name).HasMaxLength(100).HasColumnName("name");
            entity.Property(e => e.Notes).HasColumnType("text").HasColumnName("notes");
            entity.Property(e => e.StartedAt).HasColumnType("timestamp").HasColumnName("startedAt");
            entity.Property(e => e.UpdatedAt).HasColumnType("timestamp").HasColumnName("updatedAt");
            entity.Property(e => e.UserId).HasColumnName("userId");
            entity.Property(e => e.Uuid).HasColumnName("uuid");

            entity
                .HasOne(d => d.WorkoutProgramRoutine)
                .WithMany()
                .HasForeignKey("WorkoutProgramRoutineId");
        });

        OnModelCreatingPartial(modelBuilder);
    }
}
