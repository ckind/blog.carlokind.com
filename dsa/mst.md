# Minimum Spanning Tree

A minimum spanning tree (MST) is a spanning tree of a connected, undirected, weighted graph whose total edge weight is minimal.

An MST
* connects all vertices
* contains no cycles
* contains exactly V - 1 edges (where V is the number of vertices)

There are two main algorithms for computing an MST given a weighted graph. Kruskal's Algorithm and Prim's Algorithm.

## Kruskal's Algorithm

Kruskal's Algorithm is a greedy algorithm for computing an MST that utilizes a [disjoint set union](./dsu.md). Kruskal builds a minimum spanning forest that gradually merges into a single spanning tree.

The main idea is to sort all edges by weight increasingly and take the minimum edge that connects two different components. A DSU is a perfect data structure for determining whether or not a given vertex is already connected to the MST.

First initialize a DSU with each vertex (no unions yet). 

The main loop in Kruskal goes through every edge (in ascending order) and checks whether or not the vertices on the edge have already been connected in our DSU. We can easily check this by Finding the root of each vertex. If the roots match they are already connected and we can skip this edge. If not, we can union the two vertices to connect them and increment the total number of edges we've taken.

Remember that an MST contains no cycles and contains exactly V - 1 edges. Comparing DSU roots ensures that we have no cycles in our MST. Therefore we can simply terminate once we've taken V - 1 edges.

## Kruskal Implementation

Here is an application of Kruskal's Algorithm to solve [LC 1584](https://leetcode.com/problems/min-cost-to-connect-all-points/description/). Note the optimized `UnionRoot`. We can skip running find again during the union if we already have the roots.

Complexity:
* Edge generation: `O(n²)`
* Sorting edges: `O(n² log n²)` = `O(n² log n)`
* DSU ops: ~ `O(n² α(n))` (effectively linear in practice)

```csharp
public class Solution
{
    public readonly record struct Edge(int p1, int p2, int cost);

    public int MinCostConnectPoints(int[][] points)
    {
        return MinCostConnectPointsKruskal(points);
    }

    public int MinCostConnectPointsKruskal(int[][] points)
    {
        // first generate all possible edges (complete graph): O(n^2) edges
        Edge[] edges = GetEdges(points);

        // Kruskal: sort edges by weight, add if they connect two different components

        // sort edges by cost ascending
        Array.Sort(edges, (a, b) => a.cost.CompareTo(b.cost));

        // intialize DSU (union-find)
        int n = points.Length;
        int[] parent = new int[n];
        int[] rank = new int[n];

        for (int i = 0; i < n; i++)
            parent[i] = i;

        int cost = 0;
        int edgeCount = 0;
        foreach (Edge edge in edges)
        {
            // if endpoints are in different sets, take the edge
            int root1 = Find(parent, edge.p1);
            int root2 = Find(parent, edge.p2);
            if (root1 != root2)
            {
                UnionRoot(parent, rank, root1, root2);
                edgeCount++;
                cost += edge.cost;

                // MST (Minimum Spanning Tree) on n vertices has exactly n - 1 edges.
                // Once we've taken n - 1 edges, all points are connected
                if (edgeCount == n - 1)
                    return cost;
            }
        }

        return cost;
    }

    private Edge[] GetEdges(int[][] points)
    {
        // number of undirected pairs = n(n−1)/2
        int n = points.Length;
        Edge[] edges = new Edge[n * (n - 1) / 2];
        int count = 0;

        for (int i = 0; i < points.Length; i++)
        {
            for (int j = i + 1; j < points.Length; j++)
            {
                edges[count] = new Edge(i, j, GetManhattanDistance(i, j, points));
                count++;
            }
        }

        return edges;
    }

    private int GetManhattanDistance(int i, int j, int[][] points)
    {
        return Math.Abs(points[i][0] - points[j][0]) + Math.Abs(points[i][1] - points[j][1]);
    }

    private int Find(int[] parent, int x)
    {
        if (parent[x] != x)
            parent[x] = Find(parent, parent[x]);

        return parent[x];
    }

    private void UnionRoot(int[] parent, int[] rank, int rootX, int rootY)
    {
        if (rootX == rootY)
            return;

        if (rank[rootX] > rank[rootY])
            parent[rootY] = rootX;
        else if (rank[rootX] < rank[rootY])
            parent[rootX] = rootY;
        else
        {
            parent[rootY] = rootX;
            rank[rootX]++;
        }
    }
}
```

## Prim's Algorithm

Prim's is another greedy algorithm for computing the MST of a weighted graph. Unlike Kruskal's, which gradually merges sub sets to form the MST, Prim's algorithm builds the tree from one root by selecting the minimum-weight edge that connects the current tree to any vertex outside the tree.

Prim’s algorithm is justified by the cut property: at each step, the minimum-weight edge crossing the cut between the current tree and the remaining vertices is guaranteed to belong to some minimum spanning tree.

For Prim's algorithm we start by arbitrarily selecting a root vertex for our MST.

At the first iteration, we look at all outgoing edges from our root, selecting the minimum-weight one and connecting it to our current MST.

At the next iteration, we look at all edges that cross from the current tree to a vertex not yet in the tree and select the minimum-weight one.

And so on until we've added every vertex.

The [min heap](./heaps.md) makes a great data structure for tracking the minimum-weight edge of all outgoing edges from our current MST.

## Lazy Prim

Here is a simple implementation using the "Lazy" approach to Prim's algorithm. Recall C#'s PriorityQueue utilizes a min heap by default.

```csharp
public static Edge[] MSTLazy(int n, List<Edge>[] adj)
{
    PriorityQueue<Edge, int> minHeap = new();
    Edge[] mst = new Edge[n - 1];
    bool[] visited = new bool[n];
    int i = 0;

    // Start from node 0
    visited[0] = true;

    // Push its outgoing edges
    foreach (Edge edge in adj[0])
        minHeap.Enqueue(edge, edge.Weight);

    while (minHeap.Count > 0 && i < n - 1)
    {
        Edge candidate = minHeap.Dequeue();

        if (visited[candidate.To])
            continue;

        visited[candidate.To] = true;
        mst[i++] = candidate;

        // Push adjacent edges
        foreach (Edge neighbor in adj[candidate.To])
            if (!visited[neighbor.To])
                minHeap.Enqueue(neighbor, neighbor.Weight);
    }

    return mst;
}
```

This implementation is called "lazy" because we check if a vertex has been added to the MST when dequeuing. This allows multiple edges to be enqueued for each vertex. Dequeuing automatically takes the minimum-weight edge among the currently enqueued candidate edges. We terminate once we’ve added n − 1 edges to the MST (or the heap is empty).

Notice how we also check if a vertex has been visited before enqueueing. This is an optimization to reduce heap size. However it does not totally prevent multiple edges to a vertex from being enqueued. Ultimately we still rely on the visited check when the edge is dequeued.

## Eager Prim

There is also another variant of Prim's Algorithm referred to as "Eager Prim". Here's how it differs from Lazy Prim:

Lazy Prim
* heap stores edges
* you may enqueue many edges per vertex
* you filter with visited[to] when popping

Eager Prim
* heap stores vertices
* for each vertex v not in the tree, keep dist[v] = best known edge weight that would connect v to the tree
* when you find a better edge to v, you decrease-key (update priority) in the heap
* this keeps heap size ~ O(V) instead of O(E)

Eager Prim can be much more tedious to implement in C# given that the PriorityQueue API does not provide a "decrease-key" method. I will skip the eager implementation example for now. Generally Eager Prim offers better performance asymptotically on sparse graphs. Lazy Prim however, will more than suffice for most DSA exercises.

## Prim Implementation

Here is a Lazy application of Prim's Algorithm to solve [LC 1584](https://leetcode.com/problems/min-cost-to-connect-all-points/description/). Note the usage of an initial dummy edge to reduce initialization boiler plate.

Complexity:
* For each accepted vertex, loop over all other vertices: `O(n^2)`
* Heap operations: push ~`O(n²)` candidates → `O(n² log n²)` = `O(n² log n)`

```csharp
public class Solution
{
    public readonly record struct Edge(int p1, int p2, int cost);

    public int MinCostConnectPoints(int[][] points)
    {
        return MinCostConnectPointsPrim(points);
    }

    private int GetManhattanDistance(int i, int j, int[][] points)
    {
        return Math.Abs(points[i][0] - points[j][0]) + Math.Abs(points[i][1] - points[j][1]);
    }

    public int MinCostConnectPointsPrim(int[][] points)
    {
        int n = points.Length;
        int totalCost = 0;
        int visitedCount = 0;
        PriorityQueue<Edge, int> minHeap = new();
        bool[] visited = new bool[n];

        // add dummy edge to start at point 0
        minHeap.Enqueue(new Edge(0, 0, 0), 0);

        while (minHeap.Count > 0 && visitedCount < n)
        {
            Edge candidate = minHeap.Dequeue();

            if (visited[candidate.p2])
                continue;

            visited[candidate.p2] = true;
            visitedCount++;
            totalCost += candidate.cost;

            // enqueue all unvisited potential neighbors
            int p1 = candidate.p2;
            for (int p2 = 0; p2 < n; p2++)
            {
                if (visited[p2])
                    continue;

                Edge neighbor = new Edge(p1, p2, GetManhattanDistance(p1, p2, points));
                minHeap.Enqueue(neighbor, neighbor.cost);
            }
        }

        return totalCost;
    }
}
```

## Which Algorithm To Choose

For [LC 1584](https://leetcode.com/problems/min-cost-to-connect-all-points/description/) specifically Prim solidly wins. However, there are a number of factors to consider when choosing between the two for an MST problem.

Kruskal
* great when you already have an edge list
* great for sparse graphs
* DSU is the star

Prim
* great with adjacency lists
* often preferred when you can grow from a start vertex
* for dense graphs can be very competitive.


## Optimal Solution to LC 1584

The optimal solution for [LC 1584](https://leetcode.com/problems/min-cost-to-connect-all-points/description/) actually happens to be a version of Prim implemented with two nested loops as opposed to a heap. The `O(n^2)` nested loops win in the end because for this problem in particular we have to consider connecting each point to every other point. In other words we are dealing with a complete graph with `O(n^2)` edges. Heap implementations win asymptotically on sparse graphs.

Here is a heapless Prim Solution:

```csharp
public class Solution
{
    public int MinCostConnectPoints(int[][] points)
    {
        return MinCostConnectPointsPrimHeapless(points);
    }

    private int GetManhattanDistance(int i, int j, int[][] points)
    {
        return Math.Abs(points[i][0] - points[j][0]) + Math.Abs(points[i][1] - points[j][1]);
    }

    public int MinCostConnectPointsPrimHeapless(int[][] points)
    {
        int totalCost = 0;
        int n = points.Length;
        int[] minCost = new int[n];
        bool[] inMST = new bool[n];

        // minCost[i] = cheapest cost to connect i to the current MST
        // Start with vertex 0 in the MST, so initial minCost is distance to 0.
        for (int i = 0; i < n; i++)
            minCost[i] = int.MaxValue;

        minCost[0] = 0;

        for (int iter = 0; iter < n; iter++)
        {
            // pick the cheapest point not yet in MST
            int p = 0;
            int cost = int.MaxValue;
            for (int i = 0; i < n; i++)
            {
                if (!inMST[i] && minCost[i] < cost)
                {
                    cost = minCost[i];
                    p = i;
                }
            }

            // add p to MST
            inMST[p] = true;
            totalCost += cost;

            // update min distances to remaining vertices
            for (int p2 = 0; p2 < n; p2++)
            {
                if (inMST[p2])
                    continue;

                minCost[p2] = Math.Min(minCost[p2], GetManhattanDistance(p, p2, points));
            }
        }

        return totalCost;
    }
}
```