using LiftTrackerApi.Entities;
using LiftTrackerApi.Exceptions;
using LiftTrackerApi.Extensions;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Services;

public class DomainEntityService(LiftTrackerDbContext db)
{
    /// <summary>
    /// Primarily, the front end will assign a UUID to a new entity (to support optimistic concurrency and offline mode).
    /// For testing and general flexibility, we can assign a new UUID if one is not provided.
    /// </summary>
    public async Task VerifyOrAssignNewEntityUuid<T>(T newEntity)
        where T : DomainEntity
    {
        if (newEntity.Uuid == null || newEntity.Uuid == Guid.Empty)
        {
            newEntity.Uuid = Guid.NewGuid();
        }
        else
        {
            var exists = await db.Set<T>().WhereUuid(newEntity.Uuid).FirstOrDefaultAsync();
            if (exists != null)
            {
                throw new UuidAlreadyExistsException(
                    $"{newEntity.GetType().Name} with UUID {newEntity.Uuid} already exists."
                );
            }
        }
    }

    /// <summary>
    /// <p>
    /// A helper method for updating child entities within a nested structure.
    /// Allows adding new children by them being present in the updatedMap but not the existingMap,
    /// deleting them by them being absent in the updatedMap but present in the existingMap.
    /// </p>
    /// <p>
    /// Parent ownership, and by expansion swapping, is not handled here; that happens via the parent entity,
    /// however, this method will not interface with that due to the use of explicit state management.
    /// </p>
    /// <p>
    /// Parent ownership, and by expansion swapping, is not handled here; that happens via the parent entity,
    /// however, this method will not interface with that due to the use of explicit state management.
    /// </p>
    /// </summary>
    ///
    /// <see cref="ReattachRequestEntity"/>
    public void TrackEntityDiffChanges<T>(
        Dictionary<Guid, T> existingMap,
        Dictionary<Guid, T> updatedMap
    )
        where T : DomainEntity
    {
        foreach (var updated in updatedMap.Values)
        {
            var existing = existingMap.GetValueOrDefault(updated.Uuid ?? Guid.NewGuid());

            if (existing == null)
            {
                db.Entry(updated).State = EntityState.Added;
            }
            else
            {
                ReattachRequestEntity(existing, updated);
                db.Entry(updated).State = EntityState.Modified;
            }
        }

        foreach (var existing in existingMap.Values)
        {
            var stillExists = updatedMap.ContainsKey(existing.Uuid ?? Guid.NewGuid());
            if (!stillExists)
            {
                db.Entry(existing).State = EntityState.Deleted;
            }
        }
    }

    /// <summary>
    /// Because of the system's design where Ids are used as the internal key, but publicly exposed UUIDs are used,
    /// we must reattach the request entity to the existing entity to update it in the database.
    /// </summary>
    public void ReattachRequestEntity(DomainEntity existing, DomainEntity updated)
    {
        updated.Id = existing.Id;
        updated.CreatedAt = existing.CreatedAt;
        db.Entry(updated).State = EntityState.Modified;
    }
}
