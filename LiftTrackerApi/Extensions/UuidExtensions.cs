using LiftTrackerApi.Entities;
using LiftTrackerApi.Entities.Interfaces;

namespace LiftTrackerApi.Extensions;

public static class UuidExtensions
{
    public static IQueryable<T> WhereUuid<T>(this IQueryable<T> query, Guid? uuid)
        where T : DomainEntity
    {
        if (uuid == null)
            return query;

        return query.Where(d => d.Uuid != null && d.Uuid == uuid);
    }

    public static List<T> WhereUuid<T>(this List<T> source, string? uuid)
        where T : DomainEntity
    {
        if (uuid == null)
            return source;

        return source.Where(d => d.Uuid != null && d.Uuid == Guid.Parse(uuid)).ToList();
    }

    public static List<T> WhereUuid<T>(this List<T> source, Guid? uuid)
        where T : DomainEntity
    {
        if (uuid == null)
            return source;

        return source.Where(d => d.Uuid != null && d.Uuid == uuid).ToList();
    }
}
