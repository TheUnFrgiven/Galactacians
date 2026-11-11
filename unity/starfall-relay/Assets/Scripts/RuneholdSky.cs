using UnityEngine;

public sealed partial class RuneholdGame
{
    private Texture2D spaceSky;
    private void InitializeSky()
    {
        const int width = 1024, height = 640;
        var colors = new Color[width * height];
        Color dark = Hex("07122f"), blue = Hex("163d76"), violet = Hex("392859");
        for (int y = 0; y < height; y++)
            for (int x = 0; x < width; x++)
            {
                float cloud = Mathf.PerlinNoise(17 + x * .0035f, 9 + y * .004f);
                float haze = Mathf.PerlinNoise(41 + x * .002f, 27 + y * .003f);
                colors[y * width + x] = Color.Lerp(Color.Lerp(dark, blue, cloud * cloud * .65f), violet, haze * haze * .32f);
            }
        var random = new System.Random(8171);
        for (int i = 0; i < 270; i++)
        {
            int x = random.Next(2, width - 3), y = random.Next(2, height - 3);
            Color star = Color.Lerp(Hex("6285ad"), Hex("d1efff"), (float)random.NextDouble());
            colors[y * width + x] = star;
            if (i % 7 == 0) { colors[y * width + x + 1] = star; colors[(y + 1) * width + x] = star; }
        }
        spaceSky = new Texture2D(width, height, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
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
