#define PI 3.14

uniform float u_time;
uniform vec2 resolution;
uniform vec2 mouse_position;

float plot(vec2 st) {
    return smoothstep(0.0, 0.001,  abs(pow(st.y, 0.9) - st.x));
}

void main(){

    if(pow((gl_FragCoord.x - resolution.x/2), 2.0 ) + pow((gl_FragCoord.y - resolution.y/2), 2.0) - pow(20.0, 2.0) > 0.0){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }else{
        gl_FragColor = vec4(0.5, 0.0, 0.0, 1.0);
    }
}