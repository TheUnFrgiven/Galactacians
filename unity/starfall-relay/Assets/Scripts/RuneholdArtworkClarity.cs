using UnityEngine;

public sealed partial class RuneholdGame
{
    private Texture2D readableDeck;
    private void PrepareReadableArtwork()
    {
        Shader shader = Resources.Load<Shader>("Shaders/CalmDeck");
        if (deckTexture == null || shader == null || !shader.isSupported) return;
        var material = new Material(shader);
        var target = RenderTexture.GetTemporary(deckTexture.width, deckTexture.height, 0, RenderTextureFormat.ARGB32);
        RenderTexture previous = RenderTexture.active;
        try
        {
            Graphics.Blit(deckTexture, target, material);
            RenderTexture.active = target;
            readableDeck = new Texture2D(deckTexture.width, deckTexture.height, TextureFormat.RGBA32, false) { filterMode = FilterMode.Point, wrapMode = TextureWrapMode.Clamp };
            readableDeck.ReadPixels(new Rect(0, 0, target.width, target.height), 0, 0); readableDeck.Apply(false, true);
            deckTexture = readableDeck;
        }
        finally { RenderTexture.active = previous; RenderTexture.ReleaseTemporary(target); Destroy(material); }
    }
}
