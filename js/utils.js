export function radialCollision(a, b) {
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    return (dist - a.radius - b.radius < 1);
}