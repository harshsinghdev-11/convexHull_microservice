// algo/grahamsScanSteps.js
// Step-emitting Graham scan based on your existing code style

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  equals(t) {
    return this.x === t.x && this.y === t.y;
  }
}

function orientation(a, b, c) {
  const v = a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
  if (v < 0) return -1; // clockwise
  if (v > 0) return 1; // counter-clockwise
  return 0;
}

function distSq(a, b) {
  return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
}

/**
 * grahamScanSteps(points)
 *  - points: array of [x,y]
 *  - returns: { steps: [...], hull: [[x,y], ...] }
 *
 * Steps: objects { action, point, stack }
 *  - action: "pivot" | "consider" | "pop" | "push" | "final"
 *  - point: [x,y] or null
 *  - stack: snapshot array of [x,y]
 */
export function grahamScanSteps(points) {
  const out = { steps: [], hull: [] };

  if (!points || points.length === 0) return out;

  if (points.length < 3) {
    out.steps.push({ action: "final", point: null, stack: [] });
    return out;
  }

  // convert to Point objects
  const a = points.map(p => new Point(p[0], p[1]));

  // find pivot (lowest y, then lowest x)
  let p0 = a[0];
  for (let i = 1; i < a.length; i++) {
    const p = a[i];
    if (p.y < p0.y || (p.y === p0.y && p.x < p0.x)) p0 = p;
  }

  // sort by polar angle around pivot
  a.sort((pA, pB) => {
    if (pA === p0) return -1;
    if (pB === p0) return 1;
    const o = orientation(p0, pA, pB);
    if (o === 0) return distSq(p0, pA) - distSq(p0, pB);
    // orientation >0 means counter-clockwise; we want CCW first
    return o < 0 ? -1 : 1;
  });

  // remove duplicates/collinear (keep farthest)
  let m = 1;
  for (let i = 1; i < a.length; i++) {
    while (i < a.length - 1 && orientation(p0, a[i], a[i + 1]) === 0) {
      i++;
    }
    a[m] = a[i];
    m++;
  }

  if (m < 3) {
    out.steps.push({ action: "final", point: null, stack: [] });
    return out;
  }

  // steps: announce pivot
  out.steps.push({ action: "pivot", point: [Math.round(p0.x), Math.round(p0.y)], stack: [] });

  // stack start
  const st = [a[0], a[1]];
  // push initial points to steps
  out.steps.push({ action: "push", point: [Math.round(a[0].x), Math.round(a[0].y)], stack: st.map(p => [Math.round(p.x), Math.round(p.y)]) });
  out.steps.push({ action: "push", point: [Math.round(a[1].x), Math.round(a[1].y)], stack: st.map(p => [Math.round(p.x), Math.round(p.y)]) });

  for (let i = 2; i < m; i++) {
    const cur = a[i];
    // consider cur
    out.steps.push({ action: "consider", point: [Math.round(cur.x), Math.round(cur.y)], stack: st.map(p => [Math.round(p.x), Math.round(p.y)]) });

    while (st.length > 1 && orientation(st[st.length - 2], st[st.length - 1], cur) >= 0) {
      const popped = st.pop();
      out.steps.push({ action: "pop", point: [Math.round(popped.x), Math.round(popped.y)], stack: st.map(p => [Math.round(p.x), Math.round(p.y)]) });
    }

    st.push(cur);
    out.steps.push({ action: "push", point: [Math.round(cur.x), Math.round(cur.y)], stack: st.map(p => [Math.round(p.x), Math.round(p.y)]) });
  }

  out.steps.push({ action: "final", point: null, stack: st.map(p => [Math.round(p.x), Math.round(p.y)]) });
  out.hull = st.map(p => [Math.round(p.x), Math.round(p.y)]);
  return out;
}
