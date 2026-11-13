#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

internal static class RuneholdBuild
{
    public static void BuildMac()
    {
        Build(false);
    }

    public static void BuildPreview()
    {
        Build(true);
    }

    private static void Build(bool preview)
    {
        PixelArtTextureSettings.RefreshArtwork();
        string output = preview ? "Build/StarfallExpeditionPreview.app" : "Build/Runehold.app";
        Directory.CreateDirectory("Build");
        string originalIdentifier = PlayerSettings.GetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Standalone);
        FullScreenMode originalScreenMode = PlayerSettings.fullScreenMode;
        bool originalBackground = PlayerSettings.runInBackground;
        if (preview) { PlayerSettings.fullScreenMode = FullScreenMode.Windowed; PlayerSettings.runInBackground = true; }
        PlayerSettings.productName = preview ? "Starfall Expedition Preview" : "Runehold";
        if (preview) PlayerSettings.SetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Standalone, "com.moonvale.starfall.expeditionpreview");
        PlayerSettings.companyName = "Moonvale Studio";
        var options = new BuildPlayerOptions
        {
            scenes = new[] { "Assets/Scenes/Moonvale.unity" },
            locationPathName = output,
            target = BuildTarget.StandaloneOSX,
            options = BuildOptions.None
        };
        BuildReport report = BuildPipeline.BuildPlayer(options);
        PlayerSettings.productName = "Runehold";
        PlayerSettings.fullScreenMode = originalScreenMode;
        PlayerSettings.runInBackground = originalBackground;
        PlayerSettings.SetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Standalone, originalIdentifier);
        Debug.Log("Runehold build result: " + report.summary.result + " (" + report.summary.totalSize + " bytes)");
        EditorApplication.Exit(report.summary.result == BuildResult.Succeeded ? 0 : 1);
    }
}
#endif
