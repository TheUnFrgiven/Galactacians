#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

internal sealed class PixelArtTextureSettings : AssetPostprocessor
{
    public override uint GetVersion() => 2;

    internal static void RefreshArtwork()
    {
        foreach (string guid in AssetDatabase.FindAssets("t:Texture2D", new[] { "Assets/Resources/Art" }))
        {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            var importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer != null && (importer.npotScale != TextureImporterNPOTScale.None || importer.maxTextureSize != 4096))
                AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate);
        }
    }

    private void OnPreprocessTexture()
    {
        if (!assetPath.StartsWith("Assets/Resources/Art/")) return;
        var importer = (TextureImporter)assetImporter;
        importer.textureType = TextureImporterType.Default;
        importer.mipmapEnabled = false;
        importer.filterMode = FilterMode.Point;
        importer.textureCompression = TextureImporterCompression.Uncompressed;
        importer.wrapMode = TextureWrapMode.Clamp;
        // Keep authored pixel proportions. Power-of-two rescaling was subtly distorting
        // the atlas and softening the long carbine before point sampling ever ran.
        importer.npotScale = TextureImporterNPOTScale.None;
        importer.maxTextureSize = 4096;
        importer.isReadable = assetPath.EndsWith("PilotDirections.png") || assetPath.EndsWith("AlloyPickup.png") || assetPath.EndsWith("CrystalPickup.png")
            || assetPath.EndsWith("IonTurret.png") || assetPath.EndsWith("ShieldGenerator.png") || assetPath.EndsWith("SalvageRig.png")
            || assetPath.EndsWith("TurretMount.png") || assetPath.EndsWith("TurretHead.png") || assetPath.EndsWith("EmberMeteor.png")
            || assetPath.EndsWith("PlasmaCarbine.png") || assetPath.EndsWith("PilotCombatDirections.png")
            || assetPath.EndsWith("BotGuide.png") || assetPath.EndsWith("OrbitDrone.png") || assetPath.EndsWith("RepairModule.png")
            || assetPath.EndsWith("IceMeteor.png") || assetPath.EndsWith("CrystalMeteor.png") || assetPath.EndsWith("SunMeteor.png");
        if (importer.DoesSourceTextureHaveAlpha()) importer.alphaIsTransparency = true;
    }
}
#endif
