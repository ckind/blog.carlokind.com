# Arrays as HashMaps

Arrays (often called frequency arrays) can sometimes be used as replacements for hashmaps when the key space is small and fixed.

This approach works well when you are dealing with a limited and known set of possible keys.

## Char Frequency Array

For example, f your character set consists only of lowercase English letters, you can use an array of size 26 instead of a hashmap.

In this case:

The array index represents the key.

The “hash” is computed by subtracting `'a'` from the character:

```
index = c - 'a'
```

The array value stores the frequency (or other aggregate information) associated with that key.

A frequency array for lowercase English letters would be:

```
int[] freq = new int[26];
```

Each index stores the number of times that character appears.