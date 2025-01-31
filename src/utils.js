export class Queue{
    constructor(items = []){
        this.list = items;
    }
    
    enqueue(item){
        this.list.enqueue(item);
    }
    
    dequeue(){
        return this.list.shift();
    }
}