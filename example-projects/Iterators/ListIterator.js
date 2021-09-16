export default class ListIterator {
    constructor(list, start=0) {
        this.list = list;
        this.ind = start;
    }
    next() {
        if (this.ind < this.list.length) {
            return this.list[this.ind++];
        }
        else {
            return null;
        }
    }

    hasNext() {
        return this.ind < this.list.length;
    }

    currentIndex() {
        return this.ind;
    }

    previous() {
        if (this.ind > 0) {
            return this.list[--this.ind];
        }
        else {
            return null;
        }
    }

    hasPrevious() {
        return this.ind > 0;
    }

    previousIndex() {
        return this.ind - 1;
    }

    remove() {
        console.log(this.list);
        this.list.splice(this.ind, 1);
        console.log(this.list);
    }

    add(item) {
        this.list.splice(this.ind, 0, item); // index, how many to remove, item to add
        this.ind++;
    }

    set(item) {
        this.list[this.ind-1] = item;
    }

    copy() {
        return makethis.listIterator(this.list, this.ind);
    }
}