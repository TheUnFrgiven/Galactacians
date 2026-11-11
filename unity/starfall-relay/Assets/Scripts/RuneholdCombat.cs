using System.Collections.Generic;
using UnityEngine;

public sealed partial class RuneholdGame
{
    private readonly List<Meteor>[] swarmGrid = new List<Meteor>[64 * 48];
    private readonly float[] turretAngles = new float[4];
    private readonly int[] turretBarrels = new int[4];
    private Texture2D turretMountTexture, turretHeadTexture;
    private Rect turretMountUv, turretHeadUv, meteorUv;
    private float pilotAimAngle = 90, pilotMuzzleFlash;
    private float pilotWeaponKick;
    private int pilotTargetId;
    private Texture2D carbineTexture;
    private Rect carbineUv;
    private int activeEnemyCount, peakSwarmAlive, nextMeteorId;
    private readonly List<BlastRing> blastRings = new List<BlastRing>();
    private bool swarmCheckpointReady;
    private int checkpointCoreHp, checkpointScore;
    private sealed class BlastRing { public Vector2 Position; public float Age, Radius; public Color Color; }

    private static int SwarmCount(int wave) => wave <= 1 ? 360 : wave == 2 ? 640 :
        Mathf.RoundToInt(Mathf.Min(30000f, 960f + Mathf.Max(0, wave - 3) * 400f + Mathf.Pow(Mathf.Max(0, wave - 3), 2) * 20f));

    private void LoadCombatArtwork()
    {
        turretMountTexture = Resources.Load<Texture2D>("Art/TurretMount");
        turretHeadTexture = Resources.Load<Texture2D>("Art/TurretHead");
        turretMountUv = TrimTransparentBorder(turretMountTexture, new Rect(0, 0, 1, 1));
        turretHeadUv = TrimTransparentBorder(turretHeadTexture, new Rect(0, 0, 1, 1));
        meteorUv = TrimTransparentBorder(meteorTexture, new Rect(0, 0, 1, 1));
        carbineTexture = Resources.Load<Texture2D>("Art/PlasmaCarbine");
        carbineUv = TrimTransparentBorder(carbineTexture, new Rect(0, 0, 1, 1));
    }

    private void ResetCombatState()
    {
        activeEnemyCount = peakSwarmAlive = nextMeteorId = 0;
        pilotAimAngle = 90; pilotMuzzleFlash = fireTimer = 0;
        blastRings.Clear();
        swarmCheckpointReady = false;
        for (int i = 0; i < 4; i++) { turretAngles[i] = -90; turretBarrels[i] = 0; }
    }

    private void SeedOpeningSwarm()
    {
        nextMeteorId = 0;
        int count = Mathf.Min(enemyCountToSpawn, Mathf.Min(CrowdLimit, night == 1 ? 160 : night == 2 ? 220 : 280 + (night - 3) * 30));
        SpawnSwarmPack(count, true);
        spawnTimer = .65f;
    }

    private void SpawnSwarmPack(int count, bool opening)
    {
        float packAngle = UnityEngine.Random.value * Mathf.PI * 2;
        int allowed = Mathf.Min(count, Mathf.Min(enemyCountToSpawn - enemiesSpawned, CrowdLimit - activeEnemyCount));
        for (int i = 0; i < allowed; i++)
        {
            float angle = opening ? i * 2.399963f : packAngle + UnityEngine.Random.Range(-.2f, .2f);
            float ring = UnityEngine.Random.Range(.83f, 1.06f);
            Vector2 position = corePosition + new Vector2(Mathf.Cos(angle) * 1250 * ring, Mathf.Sin(angle) * 780 * ring);
            int element = (enemiesSpawned / 8) % 4;
            int armorRoll = UnityEngine.Random.Range(0, 100);
            int hp = armorRoll < 80 ? 1 : armorRoll < 97 ? 3 : 6;
            int role = night % 3 == 2 && armorRoll < 40 ? 1 : night % 3 == 0 && armorRoll < 28 ? 2 : 0;
            if (role == 1) hp = 1;
            if (role == 2) hp = 6;
            bool commander = night % 3 == 0 && enemiesSpawned == enemyCountToSpawn - 1;
            float radius = hp == 1 ? UnityEngine.Random.Range(8, 12) : hp == 3 ? 15 : 21;
            Color[] colors = { Hex("ff926b"), Hex("91e4ff"), Hex("bc91ff"), Hex("ffe38c") };
            int health = commander ? Mathf.CeilToInt((45 + night * 12) * EnemyHealthScale(night)) : Mathf.Max(1, Mathf.RoundToInt(hp * EnemyHealthScale(night)));
            meteors.Add(new Meteor {
                Id = ++nextMeteorId, Position = position, Hp = health, MaxHp = health, Commander = commander, Role = role,
                Radius = commander ? 35 : radius, Speed = 1.75f * (UnityEngine.Random.Range(15f, 21f) + Mathf.Min(35, night * 2)) * (commander ? .65f : role == 1 ? 1.6f : role == 2 ? .8f : 1),
                Angle = UnityEngine.Random.Range(0, 360), Spin = UnityEngine.Random.Range(-55, 55),
                CoreDamage = commander ? 20 + night : (hp == 1 ? 1 : hp == 3 ? 2 : 4) + Mathf.Min(20, night / 10),
                Tint = commander ? Gold : role == 1 ? Cyan : role == 2 ? Hex("bd9bff") : colors[element]
            });
            enemiesSpawned++; activeEnemyCount++;
        }
        peakSwarmAlive = Mathf.Max(peakSwarmAlive, activeEnemyCount);
        if (!opening && allowed > 0)
        {
            incomingText = "SWARM REINFORCEMENTS  +" + allowed;
            incomingBannerTimer = 1.1f;
        }
    }

    private int GridIndex(Vector2 position)
    {
        int x = Mathf.Clamp(Mathf.FloorToInt((position.x + 896) / 48), 0, 63);
        int y = Mathf.Clamp(Mathf.FloorToInt((position.y + 768) / 48), 0, 47);
        return y * 64 + x;
    }

    private void RebuildSwarmGrid()
    {
        for (int i = 0; i < swarmGrid.Length; i++) swarmGrid[i]?.Clear();
        activeEnemyCount = 0;
        foreach (Meteor enemy in meteors)
        {
            if (!enemy.Alive) continue;
            int cell = GridIndex(enemy.Position);
            if (swarmGrid[cell] == null) swarmGrid[cell] = new List<Meteor>(12);
            swarmGrid[cell].Add(enemy); activeEnemyCount++;
        }
    }

    private void UpdateSwarm(float dt)
    {
        UpdateWeaponEffects(dt);
        UpdateAscension(dt);
        UpdateFieldCombat(dt);
        nightElapsed += dt;
        RebuildSwarmGrid();
        spawnTimer -= dt;
        if (enemiesSpawned < enemyCountToSpawn && spawnTimer <= 0)
        {
            SpawnSwarmPack(SwarmPackSize(night), false);
            spawnTimer = SwarmPackInterval(night);
        }
        foreach (Meteor enemy in meteors)
        {
            if (!enemy.Alive) continue;
            enemy.Flash = Mathf.Max(0, enemy.Flash - dt * 6);
            if (!reducedMotion) enemy.Angle += enemy.Spin * dt;
            Vector2 toCore = corePosition - enemy.Position;
            if (toCore.sqrMagnitude < 28 * 28)
            {
                enemy.Alive = false; activeEnemyCount--;
                ApplyShipDamage(enemy.CoreDamage);
                if (coreHp <= 0) { phase = Phase.Defeat; return; }
                continue;
            }
            if (enemy.Role == 1)
                toCore += new Vector2(-toCore.y, toCore.x).normalized * Mathf.Sin(nightElapsed * 3 + enemy.Id) * Mathf.Min(50, toCore.magnitude * .3f);
            Vector2 separation = Vector2.zero;
            int cellIndex = GridIndex(enemy.Position), cx = cellIndex % 64, cy = cellIndex / 64, checkedNeighbors = 0;
            for (int y = Mathf.Max(0, cy - 1); y <= Mathf.Min(47, cy + 1); y++)
                for (int x = Mathf.Max(0, cx - 1); x <= Mathf.Min(63, cx + 1); x++)
                {
                    List<Meteor> cell = swarmGrid[y * 64 + x];
                    if (cell == null) continue;
                    foreach (Meteor other in cell)
                    {
                        if (other == enemy || !other.Alive || checkedNeighbors >= 12) continue;
                        Vector2 delta = enemy.Position - other.Position;
                        float desired = (enemy.Radius + other.Radius) * .72f;
                        float distanceSq = delta.sqrMagnitude;
                        if (distanceSq > .01f && distanceSq < desired * desired)
                        { separation += delta.normalized * (desired - Mathf.Sqrt(distanceSq)) * 1.7f; checkedNeighbors++; }
                    }
                }
            enemy.Velocity = Vector2.ClampMagnitude(toCore.normalized * enemy.Speed + separation, enemy.Speed * 1.5f);
            enemy.Position += enemy.Velocity * dt;
        }
        FirePilotWeapon(dt);
        FireTurretWeapons(dt);
        StepProjectiles(dt);
        // Keep collision and targeting work bounded by the active crowd during long expeditions.
        if (meteors.Count > activeEnemyCount + 96) meteors.RemoveAll(enemy => !enemy.Alive);
        if (enemiesSpawned >= enemyCountToSpawn && !AnyMeteorsAlive() && phase == Phase.Night) BeginDawn();
    }

    private static float AimAngle(Vector2 direction) => Mathf.Atan2(direction.y, direction.x) * Mathf.Rad2Deg;
    private static Vector2 AimDirection(float angle) => new Vector2(Mathf.Cos(angle * Mathf.Deg2Rad), Mathf.Sin(angle * Mathf.Deg2Rad));
    // Four authored body poses each have a fixed supporting hand. A pose change is
    // immediate; only small aiming corrections are eased, never a 180-degree orbit.
    private static readonly Vector2[] PilotGripOffsets = {
        new Vector2(-6, 0), new Vector2(23, -23), new Vector2(-20, -13), new Vector2(20, -13)
    };
    private static readonly float[] PilotFacingAngles = { 90, -90, 180, 0 };
    private void AimPilot(float wanted, float dt)
    {
        int facing = pilotFacing;
        if (Mathf.Abs(Mathf.DeltaAngle(PilotFacingAngles[facing], wanted)) > 52)
        {
            Vector2 direction = AimDirection(wanted);
            facing = Mathf.Abs(direction.x) > Mathf.Abs(direction.y) ? (direction.x < 0 ? 2 : 3) : (direction.y < 0 ? 1 : 0);
        }
        bool changedPose = facing != pilotFacing;
        pilotFacing = facing;
        pilotAimAngle = changedPose ? wanted : Mathf.MoveTowardsAngle(pilotAimAngle, wanted, 720 * dt);
    }
    private float PilotBob => reducedMotion ? 0 : pilotWalking ? Mathf.Abs(Mathf.Sin(pilotWalkCycle)) * -3 : Mathf.Sin(corePulse * 2) * .7f;
    private Vector2 PilotGunPivot => pilotPosition + PilotGripOffsets[pilotFacing] + new Vector2(0, PilotBob);
    private float PilotWeaponWidth => pilotFacing < 2 ? 29 : 42;
    private float PilotRecoil => pilotWeaponKick;
    private Vector2 PilotMuzzle => PilotGunPivot + AimDirection(pilotAimAngle) * (PilotWeaponWidth * .66f - PilotRecoil);

    private Meteor FindPilotTarget()
    {
        foreach (Meteor enemy in meteors)
            if (enemy.Id == pilotTargetId && enemy.Alive && (enemy.Position - pilotPosition).sqrMagnitude < 600 * 600) return enemy;
        Meteor next = FindTarget(pilotPosition, 600);
        pilotTargetId = next == null ? 0 : next.Id;
        return next;
    }
    private float TurretRecoil(int index) => Mathf.Clamp01(turretMuzzleFlash[index] / .12f) * 6;
    private Vector2 TurretPivot(int index) => turretPads[index] + new Vector2(0, -10);
    private float TurretHeadWidth => turretHeadTexture == null ? 84 : 44 * (turretHeadUv.width * turretHeadTexture.width) / Mathf.Max(1, turretHeadUv.height * turretHeadTexture.height);
    private Vector2 TurretMuzzle(int index)
    {
        Vector2 direction = AimDirection(turretAngles[index]);
        Vector2 perpendicular = new Vector2(-direction.y, direction.x);
        return TurretPivot(index) + direction * (TurretHeadWidth * .73f - TurretRecoil(index)) + perpendicular * (turretBarrels[index] == 0 ? -8 : 8);
    }

    private void FirePilotWeapon(float dt)
    {
        fireTimer -= dt;
        Meteor target = FindPilotTarget();
        if (target == null) return;
        Vector2 intercept = target.Position + target.Velocity * (Vector2.Distance(target.Position, PilotGunPivot) / 900);
        float wanted = AimAngle(intercept - PilotGunPivot);
        AimPilot(wanted, dt);
        // Recompute from the new hand anchor after a body-pose change.
        wanted = AimAngle(target.Position + target.Velocity * (Vector2.Distance(target.Position, PilotGunPivot) / 900) - PilotGunPivot);
        AimPilot(wanted, dt);
        if (fireTimer > 0 || Mathf.Abs(Mathf.DeltaAngle(pilotAimAngle, wanted)) > 9) return;
        if (bolts.Count >= 240) return;
        pilotMuzzleFlash = .026f;
        PlayShotSound(.32f);
        pilotWeaponKick = Mathf.Min(2.8f, pilotWeaponKick + 1.7f);
        for (int stream = 0; stream < RifleStreams && bolts.Count < 240; stream++)
        {
            Vector2 shotDirection = AimDirection(pilotAimAngle + (stream - (RifleStreams - 1) * .5f) * 7);
            bolts.Add(new Bolt { Position = PilotMuzzle, Direction = shotDirection, Speed = 900, Damage = RifleDamage,
                Color = rifleLevels >= 8 ? Gold : LearnerAccent, Life = 1.1f, Pierces = Mathf.Min(24, 3 + rifleLevels / 2 + astronautLevel / 5),
                SplashRadius = rifleLevels >= 8 ? Mathf.Min(65, 22 + rifleLevels) : 0 });
        }
        fireTimer = Mathf.Max(.035f, .1f / (1 + rifleLevels * .1f + astronautLevel * .018f));
    }

    private void FireTurretWeapons(float dt)
    {
        for (int i = 0; i < turretCount; i++)
        {
            turretFireTimers[i] -= dt;
            Meteor target = FindTarget(turretPads[i], 780);
            if (target == null) continue;
            Vector2 intercept = target.Position + target.Velocity * (Vector2.Distance(target.Position, TurretPivot(i)) / 760);
            float wanted = AimAngle(intercept - TurretPivot(i));
            turretAngles[i] = Mathf.MoveTowardsAngle(turretAngles[i], wanted, 720 * dt);
            if (turretFireTimers[i] > 0 || Mathf.Abs(Mathf.DeltaAngle(turretAngles[i], wanted)) > 10) continue;
            turretBarrels[i] = 1 - turretBarrels[i];
            turretMuzzleFlash[i] = .12f;
            PlayShotSound(.48f);
            if (bolts.Count < 240) bolts.Add(new Bolt { Position = TurretMuzzle(i), Direction = AimDirection(turretAngles[i]), Speed = 760, Damage = TurretDamage, Color = Gold, Life = 1.6f, SplashRadius = Mathf.Min(140, 62 + turretMastery * 4), Pierces = 1 });
            turretFireTimers[i] = Mathf.Max(.09f, .32f / (1 + turretMastery * .1f));
        }
    }

    private static float DistanceToSegmentSq(Vector2 point, Vector2 from, Vector2 to)
    {
        Vector2 segment = to - from;
        float t = segment.sqrMagnitude < .001f ? 0 : Mathf.Clamp01(Vector2.Dot(point - from, segment) / segment.sqrMagnitude);
        return (point - (from + segment * t)).sqrMagnitude;
    }

    private void StepProjectiles(float dt)
    {
        for (int i = bolts.Count - 1; i >= 0; i--)
        {
            Bolt bolt = bolts[i];
            Vector2 previous = bolt.Position;
            bolt.Position += bolt.Direction * bolt.Speed * dt;
            bolt.Travel += bolt.Speed * dt;
            bolt.Life -= dt;
            foreach (Meteor enemy in meteors)
            {
                if (!enemy.Alive || bolt.HitIds.Contains(enemy.Id)) continue;
                if (DistanceToSegmentSq(enemy.Position, previous, bolt.Position) > (enemy.Radius + 3) * (enemy.Radius + 3)) continue;
                bolt.HitIds.Add(enemy.Id);
                DamageMeteor(enemy, Mathf.CeilToInt(bolt.Damage), bolt.Color);
                if (bolt.SplashRadius > 0)
                {
                    foreach (Meteor nearby in meteors)
                        if (nearby != enemy && nearby.Alive && (nearby.Position - enemy.Position).sqrMagnitude <= bolt.SplashRadius * bolt.SplashRadius)
                            DamageMeteor(nearby, Mathf.CeilToInt(bolt.Damage), bolt.Color);
                    if (blastRings.Count < 40) blastRings.Add(new BlastRing { Position = enemy.Position, Radius = bolt.SplashRadius, Color = bolt.Color });
                }
                bolt.Pierces--;
                if (bolt.Pierces <= 0) break;
            }
            if (bolt.Pierces <= 0 || bolt.Life <= 0) bolts.RemoveAt(i);
        }
    }

    private void DamageMeteor(Meteor meteor, int damage, Color color)
    {
        if (!meteor.Alive) return;
        meteor.Hp -= damage; meteor.Flash = .7f;
        if (meteor.Hp > 0) { SpawnBurst(meteor.Position, color, 2); return; }
        meteor.Alive = false; activeEnemyCount--; waveMeteorsDestroyed++;
        EarnCombatExperience(meteor);
        score += 2 + night;
        SpawnBurst(meteor.Position, meteor.Tint, meteor.MaxHp > 1 ? 6 : 3);
    }

    private void UpdateWeaponEffects(float dt)
    {
        if (phase != Phase.Night) ascensionFlash = Mathf.Max(0, ascensionFlash - dt);
        pilotMuzzleFlash = Mathf.Max(0, pilotMuzzleFlash - dt);
        pilotWeaponKick = Mathf.MoveTowards(pilotWeaponKick, 0, dt * 32);
        for (int i = 0; i < 4; i++) turretMuzzleFlash[i] = Mathf.Max(0, turretMuzzleFlash[i] - dt);
        for (int i = blastRings.Count - 1; i >= 0; i--)
        { blastRings[i].Age += dt; if (blastRings[i].Age > .28f) blastRings.RemoveAt(i); }
    }

    private void DrawSwarm()
    {
        foreach (Meteor enemy in meteors)
        {
            if (!enemy.Alive) continue;
            Color tint = enemy.Flash > 0 ? Color.white : Color.Lerp(Color.white, enemy.Tint, .65f);
            DrawRotatedSprite(meteorTexture, meteorUv, enemy.Position, enemy.Radius * 2.6f, enemy.Angle, tint);
            if (enemy.MaxHp >= 6)
                ProgressBar(enemy.Position.x - 16, enemy.Position.y - 29, 32, 4, enemy.Hp / (float)enemy.MaxHp, enemy.Tint);
            if (enemy.Commander)
            {
                TextCentered("BIG METEOR", enemy.Position.x - 73, enemy.Position.y - 65, 146, 25, new GUIStyle(smallStyle) { normal = { textColor = Gold }, fontStyle = FontStyle.Bold });
                ProgressBar(enemy.Position.x - 45, enemy.Position.y - 39, 90, 7, enemy.Hp / (float)enemy.MaxHp, Gold);
            }
            else if (enemy.Role == 1) DrawBeam(enemy.Position - enemy.Velocity.normalized * 20, enemy.Position - enemy.Velocity.normalized * 9, 2, Cyan);
        }
        foreach (Bolt bolt in bolts)
        {
            DrawBeam(bolt.Position - bolt.Direction * Mathf.Min(20, bolt.Travel), bolt.Position, bolt.SplashRadius > 0 ? 4 : 2, new Color(bolt.Color.r, bolt.Color.g, bolt.Color.b, .42f));
            DrawBeam(bolt.Position - bolt.Direction * Mathf.Min(7, bolt.Travel), bolt.Position, 2, Color.white);
        }
    }

    private void DrawRotatedSprite(Texture2D texture, Rect uv, Vector2 center, float height, float angle, Color tint)
    {
        Matrix4x4 previous = GUI.matrix;
        GUI.matrix = LocalRotation(previous, angle, center);
        DrawTrimmedSprite(texture, uv, center, height, tint);
        GUI.matrix = previous;
    }

    private void DrawBeam(Vector2 from, Vector2 to, float width, Color color)
    {
        Matrix4x4 previous = GUI.matrix;
        GUI.matrix = previous * Matrix4x4.TRS(new Vector3(from.x, from.y, 0), Quaternion.Euler(0, 0, AimAngle(to - from)), Vector3.one);
        Fill(0, -width * .5f, Vector2.Distance(from, to), width, color);
        GUI.matrix = previous;
    }

    private static Matrix4x4 LocalRotation(Matrix4x4 matrix, float angle, Vector2 pivot)
        => matrix * Matrix4x4.TRS(new Vector3(pivot.x, pivot.y, 0), Quaternion.Euler(0, 0, angle), Vector3.one)
            * Matrix4x4.Translate(new Vector3(-pivot.x, -pivot.y, 0));

    private void DrawCombatTurret(int index, Vector2 position, Color tint)
    {
        DrawTrimmedSprite(turretMountTexture, turretMountUv, position + new Vector2(0, 8), 78, tint);
        Vector2 gun = TurretPivot(index) + AimDirection(turretAngles[index]) * (TurretHeadWidth * .23f - TurretRecoil(index));
        DrawRotatedSprite(turretHeadTexture, turretHeadUv, gun, 44, turretAngles[index], tint);
        if (turretMuzzleFlash[index] > 0)
        {
            Vector2 direction = AimDirection(turretAngles[index]), muzzle = TurretMuzzle(index);
            DrawBeam(muzzle, muzzle + direction * 20, 9, Gold);
            DrawBeam(muzzle, muzzle + direction * 13, 4, Color.white);
        }
    }

    private void DrawPilotWeapon()
    {
        Color energy = rifleLevels >= 8 ? Gold : LearnerAccent;
        Matrix4x4 previous = GUI.matrix;
        Vector2 pivot = PilotGunPivot;
        // Mirror horizontally in weapon space before the small local aim rotation.
        // Vertical poses keep their handedness, including when aim crosses straight up.
        bool left = pilotFacing == 2;
        float localAngle = pilotAimAngle - (left ? 180 : 0);
        GUI.matrix = LocalRotation(previous, localAngle, pivot)
            * Matrix4x4.Translate(new Vector3(pivot.x, pivot.y, 0))
            * Matrix4x4.Scale(new Vector3(left ? -1 : 1, 1, 1))
            * Matrix4x4.Translate(new Vector3(-pivot.x, -pivot.y, 0));
        float recoil = PilotRecoil, width = PilotWeaponWidth;
        float height = carbineTexture == null ? 13 : width * carbineUv.height * carbineTexture.height / Mathf.Max(1, carbineUv.width * carbineTexture.width);
        Rect body = new Rect(pivot.x - width * .34f - recoil, pivot.y - height * .32f, width, height);
        if (carbineTexture != null) GUI.DrawTextureWithTexCoords(body, LiveryTexture(carbineTexture), carbineUv);
        else Fill(body.x, body.y, body.width, body.height, PanelLight);
        // The glove is attached to the grip, not drawn along an orbit around the torso.
        Fill(pivot.x - 2 - recoil, pivot.y + 1, 5, 5, Ink);
        Fill(pivot.x - 1 - recoil, pivot.y + 1, 3, 3, Hex("a7b7cc"));
        GUI.matrix = previous;
        if (pilotMuzzleFlash > 0)
        {
            Vector2 direction = AimDirection(pilotAimAngle);
            DrawBeam(PilotMuzzle, PilotMuzzle + direction * 9, 5, energy);
            DrawBeam(PilotMuzzle, PilotMuzzle + direction * 6, 2, Color.white);
        }
    }

    private void DrawBlastRings()
    {
        foreach (BlastRing ring in blastRings)
        {
            float t = ring.Age / .28f;
            Color color = new Color(ring.Color.r, ring.Color.g, ring.Color.b, (1 - t) * .7f);
            for (int j = 0; j < 18; j++)
            {
                float angle = j * Mathf.PI * 2 / 18;
                Vector2 at = ring.Position + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * Mathf.Lerp(8, ring.Radius, t);
                Fill(Mathf.Round(at.x), Mathf.Round(at.y), 4, 4, color);
            }
        }
    }

    private void ConfigureSwarmPreview()
    {
        previewRun = true;
        turretCount = 2; shieldLevels = 1; coreMaxHp = coreHp = 125; shieldHp = ShieldCapacity;
        alloy = 6; crystal = 4; night = 2; tutorialStep = 2; showTutorial = false;
        pilotPosition = new Vector2(640, 670);
    }

    private void CaptureSwarmCheckpoint()
    {
        checkpointCoreHp = coreHp; checkpointShieldHp = shieldHp; checkpointScore = score; swarmCheckpointReady = true;
    }

    private void RetrySwarmCheckpoint()
    {
        coreHp = swarmCheckpointReady ? checkpointCoreHp : Mathf.Max(1, coreHp);
        shieldHp = swarmCheckpointReady ? checkpointShieldHp : ShieldCapacity;
        if (swarmCheckpointReady) score = checkpointScore;
        phase = Phase.Day;
        regenerationCharge = 0; droneTimer = 0;
        meteors.Clear(); bolts.Clear(); sparks.Clear(); blastRings.Clear();
        capacitors.Clear(); pulseAge = 10; pulseCharge = 35;
        activeEnemyCount = 0; buildPanelOpen = learningPanelOpen = false;
        notice = "Wave restored. Your upgrades and completed math are kept. Prepare, then start the night.";
        noticeTimer = 5;
        SaveExpedition();
    }
}
