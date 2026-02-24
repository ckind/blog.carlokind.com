# Binary Search

LC problems: [LC 704](https://leetcode.com/problems/binary-search/description/), [LC 35](https://leetcode.com/problems/search-insert-position/description/), [LC 69](https://leetcode.com/problems/sqrtx/description/), [LC 278](https://leetcode.com/problems/first-bad-version/description/), [LC 34](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/description/), [LC 153](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/description/), [LC 33](https://leetcode.com/problems/search-in-rotated-sorted-array/description/), [LC 875](https://leetcode.com/problems/koko-eating-bananas/description/)

Binary Search is an algorithm for searching any ordered sequence of values that operates in `O(log n)` time.

## Closed Interval

Binary Search can come in many forms. Two popular ones are closed interval (searching for a target value) and half-open interval (searching for a lower/upper bound). The most common application of binary search is on a sequence of sorted values, such as an array of ints sorted ascendingly. Here is a standard implemenation of a closed interval search on a sorted array of ints:

```csharp
// return the index of the target value or -1 if not found
public int Search(int[] nums, int target)
{
    int start = 0;
    int end = nums.Length - 1;

    while (start <= end)
    {
        int mid = start + (end - start) / 2;

        if (nums[mid] == target)
            return mid;

        // target is in left half
        if (nums[mid] > target)
            end = mid - 1;
        // target is in right half
        else
            start = mid + 1;
    }

    return -1;
}
```

The invariant maintained is that, inclusively, `[start, end]` always contains the value we are searching for. After checking the value of mid for our target, we can shrink our `[start, end]` window based on some monotonic principle to determine which side of mid the target value must fall in. The program terminates when target is found or our window shrinks to size 0.

## Half-Open Interval

Another popular form is the upper/lower bound form with a half-open interval. This (lower bound) can be implemented on a sorted array of ints like such:

```csharp
// return the first index where nums[index] >= target
public int SearchLowerBound(int[] nums, int target)
{
    // nums = [start...end)
    // i.e. end is exclusive
    int start = 0;
    int end = nums.Length;

    while (start < end)
    {
        int mid = start + (end - start) / 2;

        if (nums[mid] >= target)
            end = mid; // shrink right side
        else
            start = mid + 1; // eliminate mid (since nums[mid] < target)
    }

    return start;
}
```
To make this an upper bound search we simply use `if (nums[mid] > target)` in place of `if (nums[mid] >= target)`.

The invariant here is that for some monotonic predicate P, `P(x)` is known to be false for any index < start, `P(x)` is known to be true for any `index >= end`, and `P(x)` is unknown for any index, `start <= index < end`. Here our window is `[start, end)` (i.e. `[start, end - 1]`) as opposed to `[start, end]` in the closed interval form. The program terminates when the unknown window shrinks to size zero, leaving both start and end indices pointing to the first x such that `P(x) == true`. In the above example the predicate P, is that `nums[mid] >= target`, thus lower bound returns the first index where `nums[index] >= target`.

## Binary Search on Answer Space

A powerful application of Binary Search is on an answer space, `k`. Take [LC 875](https://leetcode.com/problems/koko-eating-bananas/description/) (Koko Eating Bananas) for example. After analyzing the prompt, we know the result we are looking for is an integer within the bounds of `[1, max(piles)]`. The question asks us for the minimum `k` such that `k` finishes the pile of bananas within h hours. We can define a monotonic predicate `CanFinishPile(..., h, k)` on the answer space and apply the half-open interval algorithm to return the first `k` where `CanFinishPile(..., h, k)` == true.

Another example is [LC 69](https://leetcode.com/problems/sqrtx/description/) (sqrt(x)). The strategy is the same: we binary search over an ordered numeric domain rather than an explicit array. The sequence does not need to physically exist; we only need to evaluate a monotonic predicate over the domain. The value we return is the parameter itself, not a value stored in a data structure.

The half-open interval can also be applied on the other side like `(start, end]`. In this case, our algorithm will converge on the last such index where P(index) == false as opposed to the first such index where P(index) == true.

The trick in advanced binary search problems is to model the problem so that you can identify an ordered parameter space `X`, and define a monotonic predicate `P(x)` over that space. If such a space and predicate exist, binary search becomes a candidate solution. In [LC 4](https://leetcode.com/problems/median-of-two-sorted-arrays/description/) (Median of Two Sorted Arrays), the parameter space `X`, is the number of elements we take from nums1 into our partition. Our desired `x` is not the exact answer to [LC 4](https://leetcode.com/problems/median-of-two-sorted-arrays/description/) but once we have `x` we can trivially compute the exact answer to the problem.

## Structural Binary Search

Not all binary search problems rely on a simple monotonic predicate over an answer space. Some problems instead rely on structural guarantees about the data.

In problems like [LC 33](https://leetcode.com/problems/search-in-rotated-sorted-array/description/) (Search in Rotated Sorted Array) and [LC 153](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/description/) (Find Minimum in Rotated Sorted Array), the array is not globally sorted, but it is composed of two sorted subarrays. At any index mid, at least one half of the array is guaranteed to be strictly sorted.

The strategy is to use this structural invariant to determine which half can safely be eliminated. Rather than defining a monotonic predicate over an answer space, we reason about the sorted structure of each half and shrink the search window accordingly.

Binary search still applies because each step eliminates half of the remaining search space using guaranteed structural properties.

## Unimodal / Peak Search (Slope-Based Binary Search)

Some binary search problems do not rely on a globally sorted array or a monotonic predicate over an answer space. Instead, they rely on structural properties of a unimodal or “mountain-shaped” function.

In problems like [LC 162](https://leetcode.com/problems/find-peak-element/description/) (Find Peak Element), we compare `nums[mid]` with a neighboring element (typically `nums [mid + 1]`) to determine the direction of the slope. If the slope is increasing, a peak must exist to the right; if the slope is decreasing, a peak must exist to the left.

The key invariant is that at least one peak exists within the current search interval. By reasoning about the slope rather than exact ordering, we can eliminate half of the search space each iteration.

Binary search applies because the slope comparison guarantees that a valid solution remains in one half of the interval, allowing us to shrink the window logarithmically.