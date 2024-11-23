#define PI 3.14

uniform float u_time;
uniform vec2 resolution;
uniform vec2 mouse_position;
uniform sampler2D u_texture;

varying vec2 vUv;

float plot(vec2 st) {
    return smoothstep(0.0, 0.001,  abs(pow(st.y, 0.9) - st.x));
}

void main(){
    vec4 color = texture2D(u_texture, vUv);

    if(pow((gl_FragCoord.x - mouse_position.x), 2.0 ) + pow((gl_FragCoord.y - mouse_position.y), 2.0) - pow(50.0, 2.0) > 0.0){
        gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), color, 0.1);
    }else{
        gl_FragColor = color;
    }
}