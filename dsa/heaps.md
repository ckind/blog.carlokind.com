# Heaps

A heap is a complete binary tree where every node satisfies the heap property:
* In a min-heap, each parent is ≤ its children.
* In a max-heap, each parent is ≥ its children.

Heaps are useful because they always guarantee that root is the smallest (or greatest) node in the tree. Heaps offer `O(1)` runtime for peeking at the root (min or max) element, `O(log n)` for inserting an element, and `O(log n)` for removing the root element.

## Array Representation

Heaps are often implemented using a dynamically sized array to store each node. We can use a contiguous data structure like an array because the fact that heaps are complete binary trees allows us to precisely index the parent and children of a given node.

Here is an example heap represented as an array and as a tree:

```
[0,1,2,3,4,5,6,7,8]
```

```
             0
           /   \
         1      2
       /   \   /  \
      3     4 5    6
     / \   
    7   8  
```

The array represents a breadth-first (level-order) traversal of the tree from left to right. Start at the root, then enqueue the left and right children. As each node is dequeued, enqueue its left and right children.

From that we can deduce that for a node at index `i`
* its `left child` is at index `2i + 1` (if it exists)
* its `right child` is at index `2i + 2` (if it exists)
* its `parent` is at index `(i-1)/2`

Let's take a close look at the formulas for each child first. If we want a child of node `i`, we know that every node preceding `i` will have "enqueued" two children in the array before the children of node `i`. Because the array is zero-indexed, `i` gives us the number of nodes that came before node `i`. So `2i` gives us the total number of nodes that come before the children of `i`. We simply need to apply the offsets of `+1` and `+2` to access the left and right child.

We can derive the parent formula algebraically from the child formula like so:

```
// left child
2p_i + 1 = i,
2p_i = i - 1,
p_i = (i - 1)/2

// right child
2p_i + 2 = i,
2p_i = i - 2,
p_i = (i - 2)/2
```

We can use `(i - 1)/2` for both cases because whether `i` is a left child `(2p + 1)` or right child `(2p + 2)`, integer division will truncate and correctly yield p.

## Heap Push

When we add a node to the heap we need to ensure that the heap property is preserved (min heap example: parent <= each child). Simply tacking the new node onto the end could violate this property. So after mutating the state of our heap we need to "heapify" it so that it preserves our heap property.

We can do this efficiently by adding the new node onto the end of the heap and calling a `HeapifyUp` method. `HeapifyUp` simply compares a node to its parent, and swaps them if parent > node. If we change the parent node, we risk invalidating our heap property again at the next level up. So every time we swap we need to `HeapifyUp` the new parent (unless we've reached the root).

Here is an iterative implementation of `HeapifyUp` for a min heap:

```csharp
private void HeapifyUp(int i)
{
    while (i > 0)
    {
        int parentIndex = (i - 1) / 2;

        if (heap[parentIndex] <= heap[i])
            break;

        Swap(parentIndex, i);
        i = parentIndex;
    }
}
```

This runs in `O(log n)` time because in the worst case we have to heapify all the way up to the root.

## Heap Pop

Peeking at the root is trivial with an array representation because we can just return `heapArray[0]`, but when we remove the root we must again heapify to ensure that we preserve our heap property. We can do this with a `HeapifyDown` method. For `HeapifyDown` in a min heap we take the minimum value between each children, then compare it with the parent. If the parent < the min child, then we swap the parent with its lesser child. Similarly to `HeapifyUp` once we've mutated the parent of a subtree, we've risking violating our heap property for that subtree. So we need to keep heapifying down until the parent of our subtree <= both children or we reach a leaf.

Here is an iterative implementation of `HeapifyDown` for a min heap:

```csharp
private void HeapifyDown(int i)
{
    while (true)
    {
        int leftIndex = 2 * i + 1;
        int rightIndex = 2 * i + 2;
        int minIndex = leftIndex;

        if (leftIndex >= heap.Count)
            break;

        if (rightIndex < heap.Count && heap[rightIndex] < heap[leftIndex])
            minIndex = rightIndex;

        if (heap[i] <= heap[minIndex])
            break;

        Swap(i, minIndex);
        i = minIndex;
    }
}
```

The runtime is also `O(log n)` because in the worst case we need to heapify all the way to down to a leaf.

## Min Heap Implementation

Here is an example of a full implementation of a Min Heap in C#:

```csharp
public class MinHeap
{
    private List<int> heap;

    // this builds the heap in O(n) time
    public MinHeap(int[] nums)
    {
        heap = new(nums);

        // If both children of a node are already valid heaps,
        // then calling HeapifyDown(i) will correctly fix the subtree rooted at i
        // (heap.Count / 2) - 1 is the index of the last parent
        for (int i = (heap.Count / 2) - 1; i >= 0; i--)
            HeapifyDown(i);
    }

    public int Peek()
    {
        if (heap.Count == 0)
            throw new InvalidOperationException("Heap is empty.");

        return heap[0];
    }

    public int Pop()
    {
        if (heap.Count == 0)
            throw new InvalidOperationException("Heap is empty.");

        int result = heap[0];

        // Moving the last element to the root + removing the last preserves
        // the complete-tree shape, and it can only break the min-heap order at the root,
        // which HeapifyDown(0) fixes by pushing the offending value down until
        // all parent-child comparisons are valid again.
        heap[0] = heap[heap.Count - 1];
        heap.RemoveAt(heap.Count - 1);
        if (heap.Count > 0)
            HeapifyDown(0);

        return result;
    }

    public void Push(int n)
    {
        heap.Add(n);
        HeapifyUp(heap.Count - 1);
    }

    private void Swap(int i, int j)
    {
        int swap = heap[i];
        heap[i] = heap[j];
        heap[j] = swap;
    }

    private void HeapifyUp(int i)
    {
        while (i > 0)
        {
            int parentIndex = (i - 1) / 2;

            if (heap[parentIndex] <= heap[i])
                break;

            Swap(parentIndex, i);
            i = parentIndex;
        }
    }

    private void HeapifyDown(int i)
    {
        while (true)
        {
            int leftIndex = 2 * i + 1;
            int rightIndex = 2 * i + 2;
            int minIndex = leftIndex;

            if (leftIndex >= heap.Count)
                break;

            if (rightIndex < heap.Count && heap[rightIndex] < heap[leftIndex])
                minIndex = rightIndex;

            if (heap[i] <= heap[minIndex])
                break;

            Swap(i, minIndex);
            i = minIndex;
        }
    }
}
```

## Priority Queue

Heaps are most often used to implement priority queues, where an item is enqueued with a specified priority. When an item is dequeued, the item with the highest (or lowest) priority is returned. The priority queue API does not expose arbitrary elements — it only allows access to the highest (or lowest) priority element — which makes heaps a natural data structure to implement it.

Consider a naive implementation of a priority queue. Each item is stored in an unordered array (`O(1)` enqueue), and the array is scanned for the highest priority every time an item is dequeued (`O(n)` dequeue). A heap offers both enqueue and dequeue in `O(log n)`. The naive implementation might be preferred in extreme scenarios where enqueuing occurs far more frequently than dequeuing, but if dequeues are common, the `O(n)` cost dominates, whereas the heap implementation consistently provides `O(log n)` per operation.

The PriorityQueue<TElement, TPriority> class in C# behaves as a min-heap ordered by TPriority by default, meaning the element with the smallest priority value is dequeued first.