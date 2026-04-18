using Microsoft.EntityFrameworkCore;

// ReSharper disable CollectionNeverUpdated.Global
// ReSharper disable AutoPropertyCanBeMadeGetOnly.Global
// ReSharper disable UnusedAutoPropertyAccessor.Global
// ReSharper disable PropertyCanBeMadeInitOnly.Global
// ReSharper disable MemberCanBePrivate.Global
namespace LiftTrackerApi.Dtos;

public class PaginatedListDto<T>
{
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }

    public PaginatedListDto(List<T> items, int count, int pageIndex, int pageSize)
    {
        Items = items;
        TotalCount = count;
        PageIndex = pageIndex;
        PageSize = pageSize;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        HasPreviousPage = PageIndex > 1;
        HasNextPage = PageIndex < TotalPages;
    }

    public static async Task<PaginatedListDto<T>> CreateAsync(
        IQueryable<T> source,
        int pageIndex,
        int pageSize
    )
    {
        var count = await source.CountAsync();
        var items = await source.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PaginatedListDto<T>(items, count, pageIndex, pageSize);
    }
}
