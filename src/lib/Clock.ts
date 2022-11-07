/**
 * @class 
 * @alias Clock
 * @classdesc Entries are sorted by id
 * Each counter also includes the number of values in that id
 * The values in each triple of entries are causally ordered
 * and each new value goes to the head of the list
 */
export default class Clock {
  private list: [any, any];

  constructor(entries: any, values: any) {
    this.list = [entries, values];
  }

  public get getEntries(): any {
    return this.list?.[0] ?? [];
  }

  public get getValues(): any {
    return this.list?.[1] ?? [];
  }

  public get getList(): [any, any] {
    return this.list;
  }

  public set setList(list: [any, any]) {
    this.list = list;
  }
}