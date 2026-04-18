using System.ComponentModel.DataAnnotations;

namespace LiftTrackerApi.Entities;

public static class ProgressionSchemeValidation
{
    public static IEnumerable<ValidationResult> ValidateRoutineExercise(
        ProgressionScheme? progressionScheme,
        ProgressionScheme531Settings? progressionSchemeSettings,
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

        if (progressionScheme != ProgressionScheme.FiveThreeOne)
        {
            yield break;
        }

        if (progressionSchemeSettings == null)
        {
            yield return new ValidationResult(
                "531 progression scheme settings are required.",
                [settingsMemberName]
            );
            yield break;
        }

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
                ? validationResult.MemberNames.Select(memberName => $"{settingsMemberName}.{memberName}")
                : [settingsMemberName];
            yield return new ValidationResult(validationResult.ErrorMessage, memberNames);
        }
    }

    public static IEnumerable<ValidationResult> ValidateSessionExercise(
        ProgressionScheme? progressionScheme,
        string schemeMemberName
    )
    {
        if (progressionScheme != null && !Enum.IsDefined(progressionScheme.Value))
        {
            yield return new ValidationResult(
                "Progression scheme is invalid.",
                [schemeMemberName]
            );
        }
    }
}
