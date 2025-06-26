using LiftTrackerApi.Entities;
using LiftTrackerApi.Entities.Interfaces;

namespace LiftTrackerApi.Extensions;

/// <summary>
/// Position appears on a number of entities,
/// and signifies it's ordered in terms of display and chronological order where relevant.
/// For example, the order a given <see cref="SessionExercise">SessionExercises</see>
/// is performed in is determined by its <see cref="SessionExercise.Position">Position</see>.
/// </summary>
public static class PositionableExtensions
{

    public static IQueryable<IPositionable> OrderByPosition(this IQueryable<IPositionable> query)
    {
        return query.OrderBy(p => p.Position);
    }

    public static IEnumerable<T> OrderByPosition<T>(this IEnumerable<T> source)
        where T : IPositionable
    {
        return source.OrderBy(p => p.Position);
    }
}
