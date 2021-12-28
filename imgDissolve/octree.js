class Octree {
  constructor(maxDepth, minItemsPerNode) {
    this.root = new Branch();
    this.size = 0;
    this.maxDepth = maxDepth;
    this.minItemsPerNode = minItemsPerNode;
  }

  insert(item) {
    this.root.insert(item, this.depth);
    this.size++;
  }
}

class Branch {
  constructor(width, height, depth) {
    this = {
      width,
      height,
      depth,
      children: null
    };
  }
}

class Item {
  constructor(object, x, y, z) {
    this.object = object;
    this.x = x;
    this.y = y;
    this.z = z;
  }
}