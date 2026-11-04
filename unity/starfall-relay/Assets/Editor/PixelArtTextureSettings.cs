#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

internal sealed class PixelArtTextureSettings : AssetPostprocessor
{
    private void OnPreprocessTexture()
    {
        if (!assetPath.StartsWith("Assets/Resources/Art/")) return;
        var importer = (TextureImporter)assetImporter;
        importer.textureType = TextureImporterType.Default;
        importer.mipmapEnabled = false;
        importer.filterMode = FilterMode.Point;
        importer.textureCompression = TextureImporterCompression.Uncompressed;
        importer.wrapMode = TextureWrapMode.Clamp;
        importer.maxTextureSize = 2048;
        importer.isReadable = assetPath.EndsWith("PilotDirections.png") || assetPath.EndsWith("AlloyPickup.png") || assetPath.EndsWith("CrystalPickup.png")
            || assetPath.EndsWith("IonTurret.png") || assetPath.EndsWith("ShieldGenerator.png") || assetPath.EndsWith("SalvageRig.png")
            || assetPath.EndsWith("TurretMount.png") || assetPath.EndsWith("TurretHead.png") || assetPath.EndsWith("EmberMeteor.png")
            || assetPath.EndsWith("PlasmaCarbine.png") || assetPath.EndsWith("PilotCombatDirections.png");
        if (importer.DoesSourceTextureHaveAlpha()) importer.alphaIsTransparency = true;
    }
}
#endif
