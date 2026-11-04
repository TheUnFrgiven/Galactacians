using System;
using UnityEngine;

public sealed partial class RuneholdGame
{
    private AudioSource relayMusic;
    private AudioClip relayMusicClip;
    private const float RelayBpm = 96;
    private const int MusicSampleRate = 22050;

    private void InitializeRelayMusic()
    {
        // Original 16-bar composition, synthesized here from oscillators and seeded
        // noise. No samples, recordings, external tracks or music service required.
        pilotJournal.MusicVolume = Mathf.Clamp01(pilotJournal.MusicVolume);
        relayMusic = gameObject.AddComponent<AudioSource>();
        relayMusic.playOnAwake = false; relayMusic.loop = true; relayMusic.spatialBlend = 0;
        relayMusic.priority = 128; relayMusic.volume = pilotJournal.MusicVolume;
        float beat = 60f / RelayBpm;
        float[] stereo = new float[Mathf.RoundToInt(64 * beat * MusicSampleRate) * 2];
        int[][] chords = { new[] { 50, 57, 60, 64 }, new[] { 46, 53, 57, 60 }, new[] { 53, 60, 64, 69 }, new[] { 48, 55, 57, 64 } };
        int[] melody = { 74, 72, 69, 67, 65, 69, 72, 76, 77, 76, 72, 69, 67, 64, 69, 72 };
        var random = new System.Random(960411);
        for (int bar = 0; bar < 16; bar++)
        {
            int[] chord = chords[bar % 4]; float start = bar * 4 * beat;
            foreach (int note in chord) MixRelayNote(stereo, start, beat * 4.7f, note + 12, .026f, -.45f, 2);
            // Short, syncopated electric keys leave room around the bass and drums.
            foreach (float when in new[] { .12f, 1.67f, 2.58f })
                foreach (int note in chord) MixRelayNote(stereo, start + when * beat, beat * .65f, note + 12, .046f, .25f, 1);
            int[] bass = { chord[0] - 12, chord[0] - 12, chord[1] - 12, chord[0] };
            float[] bassTimes = { 0, 1.58f, 2.5f, 3.5f };
            for (int i = 0; i < bass.Length; i++) MixRelayNote(stereo, start + bassTimes[i] * beat, beat * (i == 0 ? .9f : .38f), bass[i], .2f, 0, 0);
            if (bar % 2 == 1)
                for (int i = 0; i < 2; i++) MixRelayNote(stereo, start + (i == 0 ? .68f : 3.18f) * beat, beat * .9f,
                    melody[bar / 2 * 2 + i], .047f, i == 0 ? -.25f : .35f, 3);
            MixRelayDrum(stereo, start, 0, .29f, random);
            MixRelayDrum(stereo, start + 2.5f * beat, 0, .22f, random);
            if (bar % 4 == 3) MixRelayDrum(stereo, start + 3.75f * beat, 0, .13f, random);
            MixRelayDrum(stereo, start + beat, 1, .15f, random);
            MixRelayDrum(stereo, start + 3 * beat, 1, .17f, random);
            for (int step = 0; step < 8; step++)
            {
                float swing = step % 2 == 1 ? .07f : 0;
                MixRelayDrum(stereo, start + (step * .5f + swing) * beat, 2, step % 2 == 0 ? .045f : .028f, random);
            }
        }
        float peak = .001f;
        foreach (float sample in stereo) peak = Mathf.Max(peak, Mathf.Abs(sample));
        float gain = Mathf.Min(1, .83f / peak);
        for (int i = 0; i < stereo.Length; i++) stereo[i] *= gain;
        relayMusicClip = AudioClip.Create("Relay Afterglow - original 96 BPM", stereo.Length / 2, 2, MusicSampleRate, false);
        relayMusicClip.SetData(stereo, 0); relayMusic.clip = relayMusicClip; relayMusic.Play();
    }

    private static void MixRelayNote(float[] data, float start, float duration, int midi, float volume, float pan, int voice)
    {
        int offset = Mathf.RoundToInt(start * MusicSampleRate), length = Mathf.RoundToInt(duration * MusicSampleRate);
        double frequency = 440 * Math.Pow(2, (midi - 69) / 12.0);
        float left = Mathf.Sqrt((1 - pan) * .5f), right = Mathf.Sqrt((1 + pan) * .5f);
        for (int i = 0; i < length; i++)
        {
            double time = i / (double)MusicSampleRate, phase = time * frequency * Math.PI * 2;
            float fade = Mathf.Clamp01((length - i) / (MusicSampleRate * .09f));
            float attack = Mathf.Clamp01(i / (MusicSampleRate * (voice == 2 ? .35f : .009f)));
            float tone;
            if (voice == 0) tone = (float)(Math.Sin(phase) + .22 * Math.Sin(phase * 2)) * (float)Math.Exp(-time * 2.2);
            else if (voice == 1) tone = (float)(Math.Sin(phase + .8 * Math.Sin(phase * 2) * Math.Exp(-time * 8)) + .12 * Math.Sin(phase * 3)) * (float)Math.Exp(-time * 4);
            else if (voice == 2) tone = (float)(Math.Sin(phase) * .7 + Math.Sin(phase * 1.002) * .3);
            else tone = (float)(Math.Sin(phase) + .18 * Math.Sin(phase * 2)) * (float)Math.Exp(-time * 3);
            AddRelaySample(data, offset + i, tone * attack * fade * volume, left, right);
        }
    }

    private static void MixRelayDrum(float[] data, float start, int kind, float volume, System.Random random)
    {
        int offset = Mathf.RoundToInt(start * MusicSampleRate);
        int length = Mathf.RoundToInt(MusicSampleRate * (kind == 0 ? .27f : kind == 1 ? .16f : .065f));
        double phase = 0; float previousNoise = 0;
        for (int i = 0; i < length; i++)
        {
            float t = i / (float)MusicSampleRate, noise = (float)random.NextDouble() * 2 - 1;
            phase += (44 + 105 * Math.Exp(-t * 43)) * Math.PI * 2 / MusicSampleRate;
            float tone = kind == 0 ? (float)Math.Sin(phase) * (float)Math.Exp(-t * 19)
                : kind == 1 ? (noise * .65f + (float)Math.Sin(t * 185 * Math.PI * 2) * .35f) * (float)Math.Exp(-t * 30)
                : (noise - previousNoise) * .55f * (float)Math.Exp(-t * 65);
            previousNoise = noise;
            // A short attack avoids a click at each procedural percussion onset.
            float attack = Mathf.Clamp01(i / (MusicSampleRate * .0015f));
            float fade = Mathf.Clamp01((length - i) / (MusicSampleRate * .012f));
            float pan = kind == 2 ? .35f : 0;
            AddRelaySample(data, offset + i, tone * attack * fade * volume, Mathf.Sqrt((1 - pan) * .5f), Mathf.Sqrt((1 + pan) * .5f));
        }
    }

    private static void AddRelaySample(float[] data, int frame, float value, float left, float right)
    {
        // Wrap note releases into the start of the loop for a continuous pad tail.
        int index = frame % (data.Length / 2) * 2;
        data[index] += value * left; data[index + 1] += value * right;
    }

    private void UpdateRelayMusic(float dt)
    {
        if (relayMusic == null) return;
        float duck = !menuOpen && phase == Phase.Night ? .72f : phase == Phase.Quiz ? .65f : 1;
        relayMusic.volume = Mathf.MoveTowards(relayMusic.volume, pilotJournal.MusicVolume * duck, dt * .4f);
    }
}
