using UnityEngine;

public sealed partial class RuneholdGame
{
    private int shieldHp, checkpointShieldHp;
    private static int ShieldCapacityForRank(int rank) => rank <= 0 ? 0 : 30 + rank * 20;
    private int ShieldCapacity => ShieldCapacityForRank(shieldLevels + shieldMastery);

    private void ApplyShipDamage(int incoming)
    {
        int absorbed = Mathf.Min(shieldHp, incoming);
        shieldHp -= absorbed;
        int hullDamage = incoming - absorbed;
        if (absorbed > 0) SpawnBurst(corePosition, Cyan, 5);
        if (hullDamage <= 0) return;
        coreHp = Mathf.Max(0, coreHp - hullDamage);
        waveCoreHit = true; hurtFlash = .65f;
        SpawnBurst(corePosition, Ember, 4);
    }

    private void DrawHealthAndShield()
    {
        UiText("Health " + coreHp + "/" + coreMaxHp, new Rect(345, 7, 371, 29), 23, true);
        UiRound(new Rect(346, 40, 370, 13), Hex("dde8f2"), 6);
        if (coreHp > 0) UiRound(new Rect(346, 40, Mathf.Max(6, 370 * coreHp / (float)coreMaxHp), 13), coreHp < coreMaxHp * .35f ? Ember : Hex("39bba0"), 6);
        UiText("Shield " + shieldHp + "/" + ShieldCapacity, new Rect(345, 57, 371, 23), 19, true, UiBlue);
        UiRound(new Rect(346, 82, 370, 8), Hex("dde8f2"), 4);
        if (shieldHp > 0) UiRound(new Rect(346, 82, Mathf.Max(5, 370 * shieldHp / (float)ShieldCapacity), 8), Hex("4ebcde"), 4);
    }
}
