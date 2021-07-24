precision highp float;



uniform sampler2D boids;
uniform vec2 srcDimensions;
uniform float separation;
uniform float alignment;
uniform float cohesion;
const int MAX_BOIDS = 1000;

#define FLOAT_MAX  1.70141184e38
#define FLOAT_MIN  1.17549435e-38
lowp vec4 encode_float(highp float v) {
    highp float av = abs(v);
    
    //Handle special cases
    if(av < FLOAT_MIN) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    } else if(v > FLOAT_MAX) {
        return vec4(127.0, 128.0, 0.0, 0.0) / 255.0;
    } else if(v < -FLOAT_MAX) {
        return vec4(255.0, 128.0, 0.0, 0.0) / 255.0;
    }
    
    highp vec4 c = vec4(0,0,0,0);
    
    //Compute exponent and mantissa
    highp float e = floor(log2(av));
    highp float m = av * pow(2.0, -e) - 1.0;
    
    //Unpack mantissa
    c[1] = floor(128.0 * m);
    m -= c[1] / 128.0;
    c[2] = floor(32768.0 * m);
    m -= c[2] / 32768.0;
    c[3] = floor(8388608.0 * m);
    
    //Unpack exponent
    highp float ebias = e + 127.0;
    c[0] = floor(ebias / 2.0);
    ebias -= c[0] * 2.0;
    c[1] += floor(ebias) * 128.0; 
    
    //Unpack sign bit
    c[0] += 128.0 * step(0.0, -v);
    
    //Scale back to range
    return c / 255.0;
}
float getXorY(vec2 vec, bool x) {
    return x ? vec.x : vec.y;
}
void main() {

    bool x;
    
    vec2 myCoord = gl_FragCoord.xy / srcDimensions;
    if (int(myCoord.x) == 0) {
        x = true;
    } else if (int(myCoord.x)== 1) {
        x = false;
    }
    vec4 myData = texture2D(boids, myCoord);
    vec2 myPos = myData.xy;
    float sumOfPositions = 0.0;
    float sumOfDirections = 0.0;
    float sumOfRepulsiveForces = 0.0;
    int neighborCt;
    
    //Find the neighbors
    int boidCt = int(srcDimensions.y);
    for (int i = 0; i<MAX_BOIDS; i++) {
        if (i>=boidCt) {break;}
        if (i != int(myCoord.y)) {
            vec4 neighborData = texture2D(boids, vec2(0,i));
            vec2 neighborPos = neighborData.xy;
            vec2 neighborDir = neighborData.zw;
            float dist = distance(myPos, neighborPos);
            if (dist < 300.0) {
                sumOfPositions += getXorY(neighborPos, x);
                sumOfDirections += getXorY(neighborDir, x);
                sumOfRepulsiveForces += getXorY(normalize(neighborPos), x)/dist;
                neighborCt++;
            }
        }
        else
        {
            sumOfDirections += getXorY(myData.zw, x);
        }
    }
    if (neighborCt > 0) {
        sumOfPositions /= float(neighborCt);
        sumOfDirections /= float(neighborCt);
        sumOfRepulsiveForces /= float(neighborCt);
    }
    float value = cohesion * sumOfPositions + alignment * sumOfDirections + separation * sumOfRepulsiveForces;
    gl_FragColor = encode_float(value).abgr;
}