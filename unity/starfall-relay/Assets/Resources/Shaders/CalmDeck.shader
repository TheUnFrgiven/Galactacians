Shader "Hidden/Starfall/CalmDeck"
{
    Properties { _MainTex ("Deck", 2D) = "white" {} }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always
        Pass
        {
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment frag
            #include "UnityCG.cginc"
            sampler2D _MainTex;
            fixed4 frag(v2f_img input) : SV_Target
            {
                fixed4 source = tex2D(_MainTex, input.uv);
                half light = dot(source.rgb, half3(.2126, .7152, .0722));
                half3 color = lerp(light.xxx, source.rgb, .62);
                // Quiet the painted scenery. Full-color interactive sprites are drawn above it.
                color = lerp(color, half3(.12, .20, .32), .18);
                return fixed4(color, source.a);
            }
            ENDCG
        }
    }
}
