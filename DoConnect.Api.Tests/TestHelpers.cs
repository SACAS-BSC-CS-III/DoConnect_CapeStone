// small helpers (optional)
public static class TestHelpers
{
    public static int ExtractIdFromCreatedResponse(System.Net.Http.HttpResponseMessage resp)
    {
        try
        {
            var json = resp.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("id", out var idEl) && idEl.TryGetInt32(out var id))
                return id;
        }
        catch { }
        return 1;
    }
}