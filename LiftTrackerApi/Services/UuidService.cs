using LiftTrackerApi.Entities;
using LiftTrackerApi.Exceptions;
using LiftTrackerApi.Extensions;
using Microsoft.EntityFrameworkCore;

namespace LiftTrackerApi.Services;

public class UuidService(LiftTrackerDbContext db)
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
}
