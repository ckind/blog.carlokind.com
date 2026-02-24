# Dynamic Programming

Dynamic Programming involes recognizing a computation with dependencies on previous values of some input that would cause duplicate chains of computation. In other words, DP is useful when a problem exhibits overlapping subproblems, and an optimal substructure. A DP problem can be solved by first defining the solution to the problem for a given input algebraically.

## Fibonacci

Take fibonacci for example:

```
fib(i) = fib(i - 1) + fib(i - 2).
```

This could be computed recursively like so:

```csharp
int fib(int n)
{
    if (n < 2) return n;

    return fib(n - 1) + fib(n - 2);
}
```

This is however, inefficient, because when the two recursive calls diverge there will be much overlap in the values they compute.

## Top-Down

One DP approach is called "top-down" dynamic programming. It is normally implemented recursively and involes first trying to compute the value you want, then computing dependencies as necessary and "memo-izing" or storing the previously computed results (often in a `hashmap`) to avoid duplicate computations. Here is a top-down DP fibonacci implementation using an array (functioning like `hashmap`) for storage.

```csharp
int fib(int n)
{
    if (n < 2) return n;

    int[] fib = new int[n + 1];

    return fibTD(n, fib);
}

int fibTD(int n, int[] fib)
{
    if (n < 2) return n;

    // check if value hasn't been computed yet
    if (fib[n] == 0)
        fib[n] = fibTD(n - 1, fib) + fibTD(n - 2, fib);

    return fib[n];
}
```

## Bottom-Up

The other main approach to DP is "bottom-up", where the all the required states are computed from the base values before we compute the value we are looking for. This is often done iteratively and avoids the overhead of recursive calls on the stack. Here is a bottom-up implemention of fibonacci:

```csharp
fibBU(int n)
{
    if (n < 2) return n;

    int[] fib = new int[n + 1];
    fib[0] = 0;
    fib[1] = 1;

    for (int i = 2; i <= n; i++)
    {
        fib[i] = fib[i-1] + fib[i-2];
    }

    return fib[n];
}
```

Here we are computing the whole `fib` array and then just querying it for our desired value.

As it turns out this can be further optimized for space by only storing the values we need for the next calculation. A typical implementation for that would look like:

```csharp
fibBU(int n)
{
    if (n < 2) return n;

    int prev2 = 0;
    int prev1 = 1;

    for (int i = 2; i <= n; i++)
    {
        int current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }

    return prev1;
}
```

This is sometimes implemented using a "rolling array" like so:

```csharp
int FibBU(int n)
{
    if (n < 2) return n;

    int[] dp = new int[2];
    dp[0] = 0;
    dp[1] = 1;

    for (int i = 2; i <= n; i++)
        dp[i % 2] = dp[(i - 1) % 2] + dp[(i - 2) % 2];

    return dp[n % 2];
}
```

For fibonacci using two variables is simpler and more efficient, but the rolling array is useful when each state depends on a fixed number of previous states, but the dependency window is larger than 2 or more complex than a simple pair of variables.

The choice of whether to use top-down or bottom-up depends on the problem. Bottom-up avoids recursion stack overhead and can have better constant factors, but top-down can sometimes be prefered because it only computes the state values it needs. If many DP states are unreachable or unnecessary for the final answer, top-down memoization may be more efficient.

## The Knapsack Problem

A knapsack problem is a subclass of dynamic programming problems. The basic problem involves a set of items, each with a given weight and value. Given a weight capacity, what combination of items yields the maximum value? This problem comes in two main variants, 0/1 where you can take each item at most once, and unbounded where you can take each item as many times as you want. Let's look at a 0/1 knapsack first.

## 0/1 Knapsack

We can use a 2D array to represent our `dp` state. Let `dp[i][w]` represent the maximum value yielded from choosing from the first `i` items with capacity `w`. Our recurrence formula is:

```
let w_i = weight of item i
let v_i = value of item i

if (w_i > w)
    dp[i][w] = dp[i-1][w]
else
    dp[i][w] = max(
        dp[i-1][w],
        dp[i-1][w - w_i] + v_i
    )
```

Taking item `i` adds its value to the best value achievable using the first `i-1` items with the remaining capacity `(w - w_i)`.

Let's use this recurrence formula to implement a bottom up DP solution:

```csharp
int knapsack(int[] weights, int[] values, int capacity)
{
    int n = weights.Length;
    int[,] dp = new int[n + 1, capacity + 1];

    // dp[0, w] = 0 for all w (0 items -> 0 value), already default

    for (int i = 1; i <= n; i++)
    {
        int w_i = weights[i - 1];
        int v_i = values[i - 1];

        for (int w = 0; w <= capacity; w++)
        {
            if (w_i > w)
            {
                dp[i, w] = dp[i - 1, w];
            }
            else
            {
                dp[i, w] = Math.Max(
                    dp[i - 1, w],
                    dp[i - 1, w - w_i] + v_i
                );
            }
        }
    }

    return dp[n, capacity];
}
```

## Unbounded Knapsack

Now let's look at the unbounded knapsack where we can take as many of any item as we want. The only difference in the recurrence formula is that when we take item `i`, we can also consider combinations that already include item `i`. Here is the formula with that minor adjustment:

```
let w_i = weight of item i
let v_i = value of item i

if (w_i > w)
    dp[i][w] = dp[i-1][w]
else
    dp[i][w] = max(
        dp[i-1][w],
        dp[i][w - w_i] + v_i
    )
```

The implementation is identical except that the “take” case references `dp[i][...]` instead of `dp[i-1][...]`.

As it turns out, this solution can actually be optimized by using a 1D array instead of a 2D array, reducing the space of the solution from `O(len(i) * w)` to `O(w)`. Much like in the fibonacci example, we only need to persist the state that the value we are calculating directly depends on.

## 2D -> 1D Compression

We can implement the unbounded knapsack with a 1D array as follows:

```csharp
int knapsack(int[] weights, int[] values, int capacity)
{
    int n = weights.Length;
    int[] dp = new int[capacity + 1];

    for (int i = 1; i <= n; i++)
    {
        int w_i = weights[i - 1];
        int v_i = values[i - 1];

        for (int w = w_i; w <= capacity; w++)
        {
            dp[w] = Math.Max(dp[w], dp[w - w_i] + v_i);
        }
    }

    return dp[capacity];
}
```

This works because each iteration represents a different row of the 2D state array. When we begin iteration `i`, `dp[...]` is already filled with the values for `dp[i - 1][...]`, so `dp[w] == dp[i - 1][w]`. However, `dp[w - w_i] == dp[i][w - w_i]` because we've already updated it in the previous iteration. We simply sub these into our recurrence formula to get:

```
if (w_i <= w)
{
    dp[w] = Math.Max(
        dp[w],
        dp[w - w_i] + v_i
    );
}
```

In our implementation we account for `if (w_i <= w)` by starting our inner loop at `w_i`.

This 1D optimization can also be applied to the 0/1 knapsack. We just need to use a small trick to make it work. In the unbounded implementation, `dp[w - w_i]` behaves like `dp[i][w - w_i]`, because it has already been updated in the previous iteration of the inner loop. But in the 0/1 knapsack we need to only consider `dp[i - 1][...]` in our recurrence, since taking the same item multiple times is not allowed. We can account for this by simply iterating backwards over our capacities, `w`, in the inner loop. This still calculates all possible capacities, but guarantees that `dp[w - w_i]` is untouched at iteration `i`, leaving it in the `dp[i - 1][w - w_i]` state. The implementation is:

```
int knapsack(int[] weights, int[] values, int capacity)
{
    int n = weights.Length;
    int[] dp = new int[capacity + 1];

    for (int i = 1; i <= n; i++)
    {
        int w_i = weights[i - 1];
        int v_i = values[i - 1];

        for (int w = capacity; w >= w_i; w--)
        {
            dp[w] = Math.Max(dp[w], dp[w - w_i] + v_i);
        }
    }

    return dp[capacity];
}
```

Having gone over all steps we can now write this more concisely as:

```csharp
int knapsack(int[] weights, int[] values, int capacity)
{
    int[] dp = new int[capacity + 1];

    for (int i = 0; i < weights.Length; i++)
    {
        for (int w = capacity; w >= weights[i - 1]; w--)
        {
            dp[w] = Math.Max(dp[w], dp[w - weights[i - 1]] + values[i - 1]);
        }
    }

    return dp[capacity - 1];
}
```
