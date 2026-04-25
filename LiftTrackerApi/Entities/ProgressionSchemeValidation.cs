using System.ComponentModel.DataAnnotations;

namespace LiftTrackerApi.Entities;

public static class ProgressionSchemeValidation
{
    public static IEnumerable<ValidationResult> ValidateRoutineExercise(
        ProgressionScheme? progressionScheme,
        ProgressionSchemeSettings? progressionSchemeSettings,
        decimal? weight,
        string settingsMemberName = nameof(RoutineExercise.ProgressionSchemeSettings)
    )
    {
        if (progressionScheme != null && !Enum.IsDefined(progressionScheme.Value))
        {
            yield return new ValidationResult(
                "Progression scheme is invalid.",
                [nameof(RoutineExercise.ProgressionScheme)]
            );
            yield break;
        }

        if (progressionScheme == null)
        {
            if (progressionSchemeSettings != null)
            {
                yield return new ValidationResult(
                    "Progression scheme settings must be empty when no progression scheme is selected.",
                    [settingsMemberName]
                );
            }

            yield break;
        }

        switch (progressionScheme)
        {
            case ProgressionScheme.FiveThreeOne:
                if (
                    progressionSchemeSettings
                    is not ProgressionScheme531Settings fiveThreeOneSettings
                )
                {
                    yield return new ValidationResult(
                        "531 progression scheme settings are required.",
                        [settingsMemberName]
                    );
                    yield break;
                }

                foreach (
                    var validationResult in ValidateProgressionSettings(
                        fiveThreeOneSettings,
                        settingsMemberName
                    )
                )
                {
                    yield return validationResult;
                }

                yield break;
            case ProgressionScheme.GatedLinear:
                if (
                    progressionSchemeSettings
                    is not ProgressionSchemeGatedLinearSettings gatedLinearSettings
                )
                {
                    yield return new ValidationResult(
                        "Gated linear progression settings are required.",
                        [settingsMemberName]
                    );
                    yield break;
                }

                foreach (
                    var validationResult in ValidateProgressionSettings(
                        gatedLinearSettings,
                        settingsMemberName
                    )
                )
                {
                    yield return validationResult;
                }

                if (weight == null)
                {
                    yield return new ValidationResult(
                        "Weight is required for gated linear progression.",
                        [nameof(RoutineExercise.Weight)]
                    );
                }

                yield break;
            default:
                yield break;
        }
    }

    public static IEnumerable<ValidationResult> ValidateSessionExercise(
        ProgressionScheme? progressionScheme,
        string schemeMemberName
    )
    {
        if (progressionScheme != null && !Enum.IsDefined(progressionScheme.Value))
        {
            yield return new ValidationResult("Progression scheme is invalid.", [schemeMemberName]);
        }
    }

    private static IEnumerable<ValidationResult> ValidateProgressionSettings(
        ProgressionSchemeSettings progressionSchemeSettings,
        string settingsMemberName
    )
    {
        var validationContext = new ValidationContext(progressionSchemeSettings);
        var validationResults = new List<ValidationResult>();
        Validator.TryValidateObject(
            progressionSchemeSettings,
            validationContext,
            validationResults,
            validateAllProperties: true
        );

        foreach (var validationResult in validationResults)
        {
            var memberNames = validationResult.MemberNames.Any()
                ? validationResult.MemberNames.Select(memberName =>
                    $"{settingsMemberName}.{memberName}"
                )
                : [settingsMemberName];
            yield return new ValidationResult(validationResult.ErrorMessage, memberNames);
        }
    }
}
