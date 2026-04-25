using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace LiftTrackerApi.Entities;

internal sealed class ProgressionSchemeSettingsNewtonsoftJsonConverter
    : JsonConverter<ProgressionSchemeSettings>
{
    public override ProgressionSchemeSettings? ReadJson(
        JsonReader reader,
        Type objectType,
        ProgressionSchemeSettings? existingValue,
        bool hasExistingValue,
        JsonSerializer serializer
    )
    {
        if (reader.TokenType == JsonToken.Null)
        {
            return null;
        }

        var jsonObject = JObject.Load(reader);
        return ProgressionSchemeSettingsTypeResolver.InferKind(
            jsonObject.Properties().Select(property => property.Name)
        ) switch
        {
            ProgressionSchemeSettingsKind.FiveThreeOne => new ProgressionScheme531Settings
            {
                CurrentCycleWeek = ReadNullableInt32(jsonObject, "currentCycleWeek"),
                BodyType = ReadNullableEnum<ProgressionScheme531BodyType>(jsonObject, "bodyType"),
            },
            ProgressionSchemeSettingsKind.GatedLinear => new ProgressionSchemeGatedLinearSettings
            {
                RequiredSuccessStreak = ReadNullableInt32(jsonObject, "requiredSuccessStreak"),
                CurrentSuccessStreak = ReadNullableInt32(jsonObject, "currentSuccessStreak") ?? 0,
                TargetRpe = ReadNullableInt32(jsonObject, "targetRpe"),
                TargetReps = ReadNullableDecimal(jsonObject, "targetReps"),
                UseWeightGate = ReadBoolean(jsonObject, "useWeightGate") ?? false,
                IncrementBy = ReadNullableDecimal(jsonObject, "incrementBy"),
            },
            _ => new ProgressionSchemeSettings(),
        };
    }

    public override void WriteJson(
        JsonWriter writer,
        ProgressionSchemeSettings? value,
        JsonSerializer serializer
    )
    {
        if (value == null)
        {
            writer.WriteNull();
            return;
        }

        var jsonObject = new JObject();

        switch (value)
        {
            case ProgressionScheme531Settings fiveThreeOneSettings:
                jsonObject["currentCycleWeek"] = ToToken(fiveThreeOneSettings.CurrentCycleWeek);
                jsonObject["bodyType"] = ToToken((int?)fiveThreeOneSettings.BodyType);
                break;
            case ProgressionSchemeGatedLinearSettings gatedLinearSettings:
                jsonObject["requiredSuccessStreak"] = ToToken(
                    gatedLinearSettings.RequiredSuccessStreak
                );
                jsonObject["currentSuccessStreak"] = gatedLinearSettings.CurrentSuccessStreak;
                jsonObject["targetRpe"] = ToToken(gatedLinearSettings.TargetRpe);
                jsonObject["targetReps"] = ToToken(gatedLinearSettings.TargetReps);
                jsonObject["useWeightGate"] = gatedLinearSettings.UseWeightGate;
                jsonObject["incrementBy"] = ToToken(gatedLinearSettings.IncrementBy);
                break;
        }

        jsonObject.WriteTo(writer);
    }

    private static JToken ToToken<TValue>(TValue? value)
        where TValue : struct
    {
        return value == null ? JValue.CreateNull() : JToken.FromObject(value.Value);
    }

    private static JToken? FindProperty(JObject jsonObject, string propertyName)
    {
        return jsonObject
            .Properties()
            .FirstOrDefault(property =>
                string.Equals(property.Name, propertyName, StringComparison.OrdinalIgnoreCase)
            )
            ?.Value;
    }

    private static int? ReadNullableInt32(JObject jsonObject, string propertyName)
    {
        var token = FindProperty(jsonObject, propertyName);
        if (token == null || token.Type == JTokenType.Null)
        {
            return null;
        }

        return token.Value<int?>();
    }

    private static decimal? ReadNullableDecimal(JObject jsonObject, string propertyName)
    {
        var token = FindProperty(jsonObject, propertyName);
        if (token == null || token.Type == JTokenType.Null)
        {
            return null;
        }

        return token.Value<decimal?>();
    }

    private static bool? ReadBoolean(JObject jsonObject, string propertyName)
    {
        var token = FindProperty(jsonObject, propertyName);
        if (token == null || token.Type == JTokenType.Null)
        {
            return null;
        }

        return token.Value<bool?>();
    }

    private static TEnum? ReadNullableEnum<TEnum>(JObject jsonObject, string propertyName)
        where TEnum : struct, Enum
    {
        var rawValue = ReadNullableInt32(jsonObject, propertyName);
        if (rawValue == null)
        {
            return null;
        }

        return (TEnum)Enum.ToObject(typeof(TEnum), rawValue.Value);
    }
}
