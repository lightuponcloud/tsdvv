Dotted Version Vector Sets
==========================

[![SWUbanner](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://github.com/vshymanskyy/StandWithUkraine/blob/main/docs/README.md)

This is an implementation of the Erlang's [DVV](https://github.com/ricardobcl/Dotted-Version-Vectors) on TypeScript.

It is used in distributed systems, where UTC timestamp is unreliable value for object's version control.

Usage examples
==============

* Creating a new version
```ts
const dvv = new Dvv();
const modified_utc = Date.now().toString(); // timestamp value is used for example only. It can be anything.
const new_dvv: Clock = dvv.new_dvv(modified_utc);
const dot: Clock = dvv.create(new_dvv, 'user_id_1');
```

* Incrementing version
```ts
const context: Vector = dvv.join(dot);
const modified_utc2 = Date.now().toString();
const new_with_history: Clock = dvv.new_with_history(context, modified_utc2);
const new_dot: Clock = dvv.update(new_with_history, dot, 'user_id_2');
dvv.sync([dot, new_dot]);
```

* Detecting conflicts

Conflict is situation when two branches of the history exist.
It could happen when someone updates old version ( casual history ).

```ts
const merged_history: Clock = dvv.sync([OldVersion as Clock, NewVersion as Clock]);
const values = dvv.values(merged_history);
values.length > 1
	? console.log('Conflict detected')
	: console.log('Ok');
```

Example
=======
1. User 1 uploads file to the server, specifying version vector:

```ts
const dvv = new Dvv();
const modified_utc = Date.now().toString();
const new_dvv: Clock = dvv.new_dvv(modified_utc);
const dot: Clock = dvv.create(new_dvv, 'user_id_1');
```

2. Server checks version on a subject of conflict. Then it
stores file with version information and provides it to User 2.

```ts
const merged_history: Clock = dvv.sync([ExistingVersion as Clock, UploadedVersion as Clock]);
const values = dvv.values(merged_history);
values.length > 1
	? console.log('409 Conflict detected')
	: console.log('200 OK') // Casual history is linear
```

3. User 2 downloads file, edits it and increments its version, before uploading back to server.

```ts
const context: Vector = dvv.join(dot as Clock); // dot is a downloaded version
const modified_utc = Date.now().toString();
const new_with_history: Clock = dvv.new_with_history(context, modified_utc);
const new_dot: Clock = dvv.update(new_with_history, dot, 'user_id_2');
dvv.sync([dot, new_dot]);
```