# Disjoint Set Union (aka Union Find)

A Disjoint Set Union is used to track connected components in an undirected graph (or to maintain dynamic connectivity under edge additions), and to test whether adding an edge would connect two already-connected vertices (cycle detection). The idea is relatively simple. A set of vertices is partitioned into multiple disjoint sets, where each set represents a connected component, meaning all vertices within the same set are connected (directly or indirectly), and vertices in different sets are not connected. Each set has one vertex artbitrarilly chosen as a "representative" or "root" for that set. If two vertices have the same root then they belong to the same set, and are therefore connected.

A Disjoint Set Union only needs to implement two methods - `Union` and `Find`. This this data structure is sometimes called "Union Find".

## Data Structure

Each set is effectively a tree with its representative as the root. For numbered vertices we can use a parent[] array for storage. The array contains n integers, where n is the number of vertices, and `parent[i]` simply contains the parent of vertex `i`. If vertex `i` is a root, `parent[i] == i`.

Sets can be stored in a variety of trees from tall to short.

```
0
|
1
|
2
|
3
|
4
```

```
      0
 /  /   \  \
1   2   3   4
```

## Find

Find simply returns the root of the set that contains a given vertex. A simple implementation repeatedly follows parent pointers until it reaches a vertex whose parent is itself. This can be `O(n)` in the worst case where every vertex is contained in one tall tree. We can improve this by applying path compression. Path compression simply makes every node visited during Find point directly to the root. So in the above example, the first tree would be compressed to the second tree after running `Find(4)`.

Here is an example Find implementated recursively with Path Compression:

```csharp
public int Find(int x)
{
    if (parent[x] != x)
        parent[x] = Find(parent[x]); // compress path

    return parent[x];
}
```

## Union

The Union method takes two disjoint sets and merges them into a single set. After performing `Union(S1, S2)`, both sets will share the same representative (root). This can implemented by simply picking one set and setting the parent of its root to the root of the other set. This presents one complication however...

Our goal is to keep our trees as short as possible. When union-ing two sets in this manner the tree can naturally grow taller. Balancing the entire tree would make Union an expensive operation. So instead of fully balancing the trees, we use a heuristic: when merging two trees, we attach the root of the “smaller” tree to the root of the “larger” tree to keep overall height small. How do we efficiently deduce that? There are two options for tracking <i>approximate</i> tree height - size and rank. We will look at rank first.

Rank is the maximum height we have seen thus far for a given tree root. Rank does not guarantee that the tree is always this height, as it can be compressed during the Find operation. When choosing which root to use as the new root in our Union operation we choose the root with the higher rank, minimizing the impact it has on our new tree's total height. If we attach a smaller tree to the root of larger tree, the overall height is unchanged. If both heights are equal then we height of new tree is increased by 1 (in this case we increase our rank by 1).

Remember that rank is just an approximation and not a guarantee of tree height. Calculating a guaranteed tree height would also make union an expensive operation.

Here is an implementation of a Union by rank:

```csharp
public void Union(int x, int y)
{
    // get the representative (root) of each element’s set
    int rootX = Find(x);
    int rootY = Find(y);

    if (rootX == rootY)
        return; // already in the same set

    // rank is a heuristic upper bound on tree height
    // attach smaller-rank root under larger-rank root to keep trees shallow.
    if (rank[rootX] > rank[rootY])
        parent[rootY] = rootX;
    else if (rank[rootY] > rank[rootX])
        parent[rootX] = rootY;
    else
    {
        // ranks are equal so it doesn't matter which is parent
        // either way the rank of new root will increase by exactly one
        parent[rootX] = rootY;
        rank[rootY]++;
    }
}
```

Union by size simply compares the total number of vertices in each tree and sums the two together for the new tree.

## The Magic of Union Find

The reason we can lazily compress paths and heuristically rank tree heights is because these two optimizations work beautifully together. When both optimizations are used, the amortized time per Find or Union operation is O(α(n)), where α(n) is the inverse Ackermann function.

The inverse Ackermann function grows extraordinarily slowly — so slowly that for any input size encountered in practice, α(n) is less than 5. Therefore, the amortized cost per operation is effectively constant.

This applies to both Union by rank and Union by size.

## Full Union Find Implenentation

Here's a full implementation in C#:

```csharp
public class DSU
{
    int[] parent;
    int[] rank;

    public DSU(int size)
    {
        parent = new int[size];
        rank = new int[size];

        for (int i = 0; i < size; i++)
        {
            parent[i] = i;
        }
    }

    public int Find(int x)
    {
        if (parent[x] != x)
            parent[x] = Find(parent[x]); // compress path

        return parent[x];
    }

    public void Union(int x, int y)
    {
        // get the representative (root) of each element’s set
        int rootX = Find(x);
        int rootY = Find(y);

        if (rootX == rootY)
            return; // already in the same set

        // rank is a heuristic upper bound on tree height
        // attach smaller-rank root under larger-rank root to keep trees shallow.
        if (rank[rootX] > rank[rootY])
            parent[rootY] = rootX;
        else if (rank[rootY] > rank[rootX])
            parent[rootX] = rootY;
        else
        {
            // ranks are equal so it doesn't matter which is parent
            // either way the rank of new root will increase by exactly one
            parent[rootX] = rootY;
            rank[rootY]++;
        }
    }
}
```