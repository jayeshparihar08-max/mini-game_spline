const fs = require('fs');

const buf = fs.readFileSync('f:/mini game/public_scene.splinecode');

// Camera settings for elevated full body view
const camX = 0.0;
const camY = 480.0;
const camZ = 1420.0;
const targetY = 195.0;

const deltaY = targetY - camY; // -285.0
const deltaZ = -camZ;          // -1420.0
const pitchDeg = Math.atan2(deltaY, camZ) * (180 / Math.PI); // -11.3486 deg
const orbitDist = Math.hypot(deltaY, camZ); // ~1448.3

// Offset 2347: position.x
buf.writeDoubleBE(camX, 2347 + 1);

// Offset 2356: position.y
buf.writeDoubleBE(camY, 2356 + 1);

// Offset 2365: position.z
buf.writeDoubleBE(camZ, 2365 + 1);

// Offset 2375: rotation.x (pitch in degrees)
buf.writeDoubleBE(pitchDeg, 2375 + 1);

// Offset 2384: rotation.y
buf.writeDoubleBE(0.0, 2384 + 1);

// Offset 2393: rotation.z
buf.writeDoubleBE(0.0, 2393 + 1);

// Offset 2492: orbit distance
buf.writeDoubleBE(orbitDist, 2492 + 1);

fs.writeFileSync('f:/mini game/scene.splinecode', buf);
fs.writeFileSync('f:/mini game/dist/scene.splinecode', buf);

console.log(`Updated scene.splinecode:
  Camera Position: (0, ${camY}, ${camZ})
  Pitch Angle: ${pitchDeg.toFixed(2)} deg (elevated downward view)
  Target Y: ${targetY} (centers bear vertically with ample headroom and footroom)
  Orbit Distance: ${orbitDist.toFixed(1)}
`);
