using LiftTrackerApi.Entities;

namespace LiftTrackerApi.Services;

public class ProgressionSchemeRegistry(IEnumerable<IProgressionSchemeStrategy> strategies)
{
    private readonly Dictionary<ProgressionScheme, IProgressionSchemeStrategy> _strategies =
        strategies.ToDictionary(strategy => strategy.Scheme);

    public IProgressionSchemeStrategy GetRequiredStrategy(ProgressionScheme? progressionScheme)
    {
        if (progressionScheme == null)
        {
            throw new ArgumentException("Progression scheme is required.");
        }

        if (_strategies.TryGetValue(progressionScheme.Value, out var strategy))
        {
            return strategy;
        }

        throw new ArgumentException($"Unsupported progression scheme: {progressionScheme.Value}.");
    }
}
