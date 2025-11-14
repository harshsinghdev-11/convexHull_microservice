//start
//smallest y-coordinate - This point is always on the convex hull
//sorts the remaining points by their polar angle with respect to the starting point.
//algorithm then iteratively adds points to the convex hull
// the algorithm checks whether the last two points added to the convex hull form a right turn. If they do, then the last point is removed from the convex hull. Otherwise, the next point in the sorted list is added to the convex hull.

class Point{
    constructor(x,y){
        this.x = x;
        this.y=y;
    }

    equals(t){
        return this.x==t.x && this.y==t.y;
    }
}

//calculate orientation
 function orientation(a,b,c){
    //it's a determinant of these points
    const v = a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
    if(v<0) return -1; //clock wise
    if(v>0) return 1;
    return 0;
}

function distSq(a,b){
    return (a.x - b.x) * (a.x - b.x) +  (a.y - b.y) * (a.y - b.y);
}

export function findConvexHull(points){
    const n = points.length;

    if(n<3) return [[-1]];

    const a = points.map(p=>new Point(p[0],p[1]));

    //point with the lowest y-coordinate (and leftmost if tie)

    const p0=a.reduce((min,p)=>(p.y<min.y || (p.y===min.y && p.x<min.x))?p:min,a[0]);

    //sorting the points by polar angle 
    a.sort((a,b)=>{
        const o = orientation(p0,a,b);

        if(o==0){
            return distSq(p0,a)-distSq(p0,b);
        }

        return o<0?-1:1;
    })

    //removing duplicate collinear points (keep fathest one)
    let m = 1;
    for (let i = 1; i < a.length; i++) {

        // Skip closer collinear points
        while (i < a.length - 1 && orientation(p0, a[i], a[i + 1]) === 0) {
            i++;
        }

        // Keep current point in place
        a[m] = a[i];
        m++;
    }
    if(m<3) return [[-1]];
    const st = [a[0],a[1]];

    for(let i=2;i<m;i++){
                while (st.length > 1 && orientation(st[st.length - 2], st[st.length - 1], a[i]) >= 0) {
            st.pop();
        }

        // Add current point to stack
        st.push(a[i]);
    }

    if (st.length < 3) return [[-1]];

    // Convert hull points to [x, y] arrays
    return st.map(p => [Math.round(p.x), Math.round(p.y)]);
}

