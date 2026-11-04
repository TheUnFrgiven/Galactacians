#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

[InitializeOnLoad]
internal static class RuneholdProjectSetup
{
    private const string StarterScenePath = "Assets/Scenes/Moonvale.unity";

    static RuneholdProjectSetup()
    {
        EditorApplication.delayCall += EnsureStarterScene;
    }

    private static void EnsureStarterScene()
    {
        if (File.Exists(StarterScenePath)) return;
        Directory.CreateDirectory("Assets/Scenes");
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var root = new GameObject("Runehold Prototype");
        root.AddComponent<RuneholdGame>();
        EditorSceneManager.SaveScene(scene, StarterScenePath);
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(StarterScenePath, true) };
    }
}
#endif
