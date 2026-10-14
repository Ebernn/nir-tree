# NIR-Tree

A TypeScript implementation of [NIR-Tree: A Non-Intersecting R-Tree](https://doi.org/10.1145/3468791.3468818) (Langendoen, Glasbergen & Daudjee, SSDBM 2021).

<!-- oxfmt-ignore -->
```ts
import { NIRTree } from "./src/nirTree";

const tree = new NIRTree(50); // maximum fanout
tree.insert([1, 2]).insert([3, 4]);
tree.search([[0, 0], [2, 3]]); // [[1, 2]]
tree.remove([1, 2]);
```

```sh
npm install
npm run dev    # interactive demo
npm test       # vitest
npm run lint   # oxlint + oxfmt --check
```
