using UnityEngine;

public sealed partial class RuneholdGame
{
    private Texture2D spaceSky;
    private void InitializeSky()
    {
        const int width = 320, height = 200;
        var colors = new Color[width * height];
        Color dark = Hex("07122f"), blue = Hex("163d76"), violet = Hex("392859");
        for (int y = 0; y < height; y++)
            for (int x = 0; x < width; x++)
            {
                float cloud = Mathf.PerlinNoise(17 + x * .011f, 9 + y * .013f);
                float haze = Mathf.PerlinNoise(41 + x * .006f, 27 + y * .01f);
                float dither = ((x + y) % 2 == 0 ? .04f : -.04f);
                float band = Mathf.Clamp01(Mathf.Floor((cloud + dither) * 7) / 7);
                float purple = Mathf.Floor(haze * 5) / 5;
                colors[y * width + x] = Color.Lerp(Color.Lerp(dark, blue, band * band * .65f), violet, purple * purple * .32f);
            }
        var random = new System.Random(8171);
        for (int i = 0; i < 75; i++)
        {
            int x = random.Next(2, width - 3), y = random.Next(2, height - 3);
            Color star = Color.Lerp(Hex("6285ad"), Hex("d1efff"), (float)random.NextDouble());
            colors[y * width + x] = star;
            if (i % 11 == 0) { colors[y * width + x + 1] = star * .6f; colors[y * width + x - 1] = star * .6f; colors[(y + 1) * width + x] = star * .6f; colors[(y - 1) * width + x] = star * .6f; }
        }
        spaceSky = new Texture2D(width, height, TextureFormat.RGBA32, false) { filterMode = FilterMode.Point, wrapMode = TextureWrapMode.Clamp };
        spaceSky.SetPixels(colors); spaceSky.Apply(false, true);
    }

    private void DrawScreenBackdrop()
    {
        Matrix4x4 previous = GUI.matrix; GUI.matrix = Matrix4x4.identity;
        Color old = GUI.color; GUI.color = Color.white;
        if (menuOpen && phase != Phase.Quiz) GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), pixel, ScaleMode.StretchToFill, true, 0, Hex("edf4ff"), 0, 0);
        else if (spaceSky != null) GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), spaceSky, ScaleMode.ScaleAndCrop, false);
        GUI.color = old; GUI.matrix = previous;
    }
}
