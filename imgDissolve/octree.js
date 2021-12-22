class octree {
  constructor() {
    this.root = null;
    this.size = 0;
  }
}

class branch {
  constructor() {
    this.xPos = null, this.yPos = null, this.zPos = null;
    this.xNeg = null, this.yNeg = null, this.zNeg = null; 
  }
}