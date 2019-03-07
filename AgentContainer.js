class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    contains(p) {
        return p.x >= this.x &&
            p.y >= this.y &&
            p.x < this.x + this.w &&
            p.y < this.y + this.h
    }
}

class Circle {
    constructor(x, y, r) {
      this.x = x;
      this.y = y;
      this.r = r;
    }
  
    contains(point) {
      return ((point.x - this.x) ** 2 + (point.y - this.y) ** 2) <= this.r ** 2;
    }
  
    intersects(range) {
        const center = new Point(this.x, this.y)
        const max_ranges = [
            new Rectangle(range.x - this.r, range.y         , range.w + this.r, range.h),
            new Rectangle(range.x         , range.y - this.x, range.w         , range.h + this.r),

            new Circle(range.x          , range.y          , this.r),
            new Circle(range.x + range.w, range.y          , this.r),
            new Circle(range.x          , range.y + range.h, this.r),
            new Circle(range.x + range.w, range.y + range.h, this.r)
        ]
        for(const r of max_ranges)
            if(r.contains(center))
                return true
        return false
    }
  }

class QuadTree {
    constructor(boundary, capacity = 1, isRoot = true) {
        this.boundary = boundary
        this.capacity = capacity
        this.agents = []
        if(isRoot)
            this.isRoot = true
    }

    makeChild(xoffset, yoffset) {
        return new QuadTree(new Rectangle(this.boundary.x + xoffset * this.boundary.w / 2, this.boundary.y + yoffset * this.boundary.h / 2, this.boundary.w / 2, this.boundary.h / 2), this.capacity)
    }

    makeParent(xoffset, yoffset, prop) {
        this.isRoot = false
        const parent = new QuadTree(new Rectangle(this.boundary.x - xoffset * this.boundary.w, this.boundary.y - yoffset * this.boundary.h, this.boundary.w * 2, this.boundary.h * 2), this.capacity, true)
        parent[prop] = this
        return parent
    }

    divide() {
        if(!this.ne) this.ne = this.makeChild(1, 0)
        if(!this.nw) this.nw = this.makeChild(0, 0)
        if(!this.sw) this.sw = this.makeChild(0, 1)
        if(!this.se) this.se = this.makeChild(1, 1)
        this.divided = true
    }

    insert(p) {
        if(!this.boundary.contains(p))
        {
            if(this.isRoot) {
                let curr = this,
                    parent
                const expand = (function() {
                    let {x, y} = curr.boundary
                    if(p.x < x && p.y < y)
                        return [1, 1, 'se']
                    else if(p.x >= x && p.y < y)
                        return [0, 1, 'sw']
                    else if(p.x < x && p.y >= y)
                        return [1, 0, 'ne']
                    else if(p.x >= x && p.y >= y)
                        return [0, 0, 'nw']
                })()
                do {
                    parent = curr.makeParent(...expand)
                    parent.divide()
                    curr = parent
                } while(!parent.boundary.contains(p))
                return parent
            } else {
                return
            }
        } else {
            if(this.agents.length < this.capacity){
                this.agents.push(p)
            } else {
                this.overflow(p)
            }
            return this
        }
    }

    overflow(p) {
        if(!this.divided)   
            this.divide()
        this.ne.insert(p)
        this.nw.insert(p)
        this.sw.insert(p)
        this.se.insert(p)
    }

    getInCircle(x, y, r) {
        return this.get(new Circle(x, y, r))
    }

    get(range, list = []) {    
        if (!range.intersects(this.boundary)) {
            return list;
        }
        for (let p of this.agents) {
            if (range.contains(p)) {
                list.push(p);
            }
        }
        if (this.divided) {
            this.ne.get(range, list);
            this.nw.get(range, list);
            this.sw.get(range, list);
            this.se.get(range, list);
        }
    
        return list;
    }

    [Symbol.iterator]() {
        return this.agents.values()
    }
}

class AgentContainer {

    constructor() {
        this.agents = []
    }

    copy() {
        const agents_copy = []
        for(let i = 0; i < this.agents.length; i++) {
            const agent = Object.assign(new (this.agents[i].constructor)(), this.agents[i])
            agents_copy.push(agent)
            agent._ssinternal.original = this.agents[i]
        }
        const r = new AgentContainer()
        r.agents = agents_copy
        return r
    }

    push(agent) {
        this.agents.push(agent)
    }

    [Symbol.iterator]() {
        return this.agents.values()
    }
}

export {AgentContainer, QuadTree, Rectangle};