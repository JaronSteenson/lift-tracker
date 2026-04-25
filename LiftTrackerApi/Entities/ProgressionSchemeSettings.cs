using System.Text.Json;
using System.Text.Json.Serialization;

namespace LiftTrackerApi.Entities;

[JsonConverter(typeof(ProgressionSchemeSettingsJsonConverter))]
[Newtonsoft.Json.JsonConverter(typeof(ProgressionSchemeSettingsNewtonsoftJsonConverter))]
public class ProgressionSchemeSettings
{
    public virtual ProgressionSchemeSettings Clone()
    {
        return new ProgressionSchemeSettings();
    }
}

internal enum ProgressionSchemeSettingsKind
{
    Unknown = 0,
    FiveThreeOne = 1,
    GatedLinear = 2,
}

internal static class ProgressionSchemeSettingsTypeResolver
{
    private static readonly HashSet<string> FiveThreeOnePropertyNames =
    [
        "currentcycleweek",
        "bodytype",
    ];

    private static readonly HashSet<string> GatedLinearPropertyNames =
    [
        "requiredsuccessstreak",
        "currentsuccessstreak",
        "targetrpe",
        "targetreps",
        "useweightgate",
        "incrementby",
    ];

    public static ProgressionSchemeSettingsKind InferKind(IEnumerable<string> propertyNames)
    {
        var hasFiveThreeOneProperties = false;
        var hasGatedLinearProperties = false;

        foreach (var propertyName in propertyNames)
        {
            var normalizedName = propertyName.Replace("_", string.Empty).ToLowerInvariant();
            hasFiveThreeOneProperties |= FiveThreeOnePropertyNames.Contains(normalizedName);
            hasGatedLinearProperties |= GatedLinearPropertyNames.Contains(normalizedName);
        }

        return (hasFiveThreeOneProperties, hasGatedLinearProperties) switch
        {
            (true, false) => ProgressionSchemeSettingsKind.FiveThreeOne,
            (false, true) => ProgressionSchemeSettingsKind.GatedLinear,
            _ => ProgressionSchemeSettingsKind.Unknown,
        };
    }
}

internal sealed class ProgressionSchemeSettingsJsonConverter
    : JsonConverter<ProgressionSchemeSettings>
{
    public override ProgressionSchemeSettings? Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        using var jsonDocument = JsonDocument.ParseValue(ref reader);
        if (jsonDocument.RootElement.ValueKind != JsonValueKind.Object)
        {
            throw new JsonException("Progression scheme settings must be a JSON object.");
        }

        var root = jsonDocument.RootElement;
        return ProgressionSchemeSettingsTypeResolver.InferKind(
            root.EnumerateObject().Select(property => property.Name)
        ) switch
        {
            ProgressionSchemeSettingsKind.FiveThreeOne => new ProgressionScheme531Settings
            {
                CurrentCycleWeek = ReadNullableInt32(root, "currentCycleWeek"),
                BodyType = ReadNullableEnum<ProgressionScheme531BodyType>(root, "bodyType"),
            },
            ProgressionSchemeSettingsKind.GatedLinear => new ProgressionSchemeGatedLinearSettings
            {
                RequiredSuccessStreak = ReadNullableInt32(root, "requiredSuccessStreak"),
                CurrentSuccessStreak = ReadInt32(root, "currentSuccessStreak") ?? 0,
                TargetRpe = ReadNullableInt32(root, "targetRpe"),
                TargetReps = ReadNullableDecimal(root, "targetReps"),
                UseWeightGate = ReadBoolean(root, "useWeightGate") ?? false,
                IncrementBy = ReadNullableDecimal(root, "incrementBy"),
            },
            _ => new ProgressionSchemeSettings(),
        };
    }

    public override void Write(
        Utf8JsonWriter writer,
        ProgressionSchemeSettings value,
        JsonSerializerOptions options
    )
    {
        writer.WriteStartObject();

        switch (value)
        {
            case ProgressionScheme531Settings fiveThreeOneSettings:
                WriteNullableNumber(writer, "currentCycleWeek", fiveThreeOneSettings.CurrentCycleWeek);
                WriteNullableNumber(writer, "bodyType", (int?)fiveThreeOneSettings.BodyType);
                break;
            case ProgressionSchemeGatedLinearSettings gatedLinearSettings:
                WriteNullableNumber(
                    writer,
                    "requiredSuccessStreak",
                    gatedLinearSettings.RequiredSuccessStreak
                );
                writer.WriteNumber("currentSuccessStreak", gatedLinearSettings.CurrentSuccessStreak);
                WriteNullableNumber(writer, "targetRpe", gatedLinearSettings.TargetRpe);
                WriteNullableNumber(writer, "targetReps", gatedLinearSettings.TargetReps);
                writer.WriteBoolean("useWeightGate", gatedLinearSettings.UseWeightGate);
                WriteNullableNumber(writer, "incrementBy", gatedLinearSettings.IncrementBy);
                break;
        }

        writer.WriteEndObject();
    }

    private static bool TryGetProperty(
        JsonElement root,
        string propertyName,
        out JsonElement value
    )
    {
        foreach (var property in root.EnumerateObject())
        {
            if (string.Equals(property.Name, propertyName, StringComparison.OrdinalIgnoreCase))
            {
                value = property.Value;
                return true;
            }
        }

        value = default;
        return false;
    }

    private static int? ReadInt32(JsonElement root, string propertyName)
    {
        if (!TryGetProperty(root, propertyName, out var value) || value.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var intValue))
        {
            return intValue;
        }

        if (
            value.ValueKind == JsonValueKind.String
            && int.TryParse(value.GetString(), out var parsedValue)
        )
        {
            return parsedValue;
        }

        throw new JsonException($"Property {propertyName} must be a whole number.");
    }

    private static int? ReadNullableInt32(JsonElement root, string propertyName)
    {
        return ReadInt32(root, propertyName);
    }

    private static decimal? ReadNullableDecimal(JsonElement root, string propertyName)
    {
        if (!TryGetProperty(root, propertyName, out var value) || value.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        if (value.ValueKind == JsonValueKind.Number && value.TryGetDecimal(out var decimalValue))
        {
            return decimalValue;
        }

        if (
            value.ValueKind == JsonValueKind.String
            && decimal.TryParse(value.GetString(), out var parsedValue)
        )
        {
            return parsedValue;
        }

        throw new JsonException($"Property {propertyName} must be a decimal number.");
    }

    private static bool? ReadBoolean(JsonElement root, string propertyName)
    {
        if (!TryGetProperty(root, propertyName, out var value) || value.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        if (value.ValueKind is JsonValueKind.True or JsonValueKind.False)
        {
            return value.GetBoolean();
        }

        if (
            value.ValueKind == JsonValueKind.String
            && bool.TryParse(value.GetString(), out var parsedValue)
        )
        {
            return parsedValue;
        }

        throw new JsonException($"Property {propertyName} must be a boolean.");
    }

    private static TEnum? ReadNullableEnum<TEnum>(JsonElement root, string propertyName)
        where TEnum : struct, Enum
    {
        var rawValue = ReadInt32(root, propertyName);
        if (rawValue == null)
        {
            return null;
        }

        return (TEnum)Enum.ToObject(typeof(TEnum), rawValue.Value);
    }

    private static void WriteNullableNumber<TValue>(
        Utf8JsonWriter writer,
        string propertyName,
        TValue? value
    )
        where TValue : struct
    {
        if (value == null)
        {
            writer.WriteNull(propertyName);
            return;
        }

        switch (value)
        {
            case int intValue:
                writer.WriteNumber(propertyName, intValue);
                break;
            case decimal decimalValue:
                writer.WriteNumber(propertyName, decimalValue);
                break;
            default:
                throw new JsonException($"Unsupported number type for {propertyName}.");
        }
    }
}
