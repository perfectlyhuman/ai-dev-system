# /check-assumptions - Debug Reflection

## Purpose
When stuck on a problem, step back and systematically examine your assumptions. Helps break out of unproductive loops by questioning what you believe to be true.

## When to Use
- Multiple approaches have failed
- Code "should" work but doesn't
- Error messages don't make sense
- Going in circles

## Mode
- **Read from**: Current context, code, errors
- **Write to**: Nothing (analysis only)

## Execution Steps

### 1. Catalog What You've Tried
```
## Attempted Solutions

1. [Approach 1]
   - What I did: [specific actions]
   - Expected: [what should have happened]
   - Actual: [what actually happened]
```

### 2. Extract Assumptions
```
## Assumptions Behind Each Attempt

1. [Approach 1] assumed:
   - [Assumption A]: [What I believed]
   - [Assumption B]: [Another belief]
```

Common categories:
- **Data**: "This value is always present"
- **State**: "This runs after X"
- **API**: "This returns X"
- **Environment**: "This env var is set"
- **Code flow**: "This function is called"

### 3. Evaluate Each Assumption
```
### Assumption: [Statement]

**Confidence level**: [High/Medium/Low]

**Evidence supporting it**:
- [What makes me think this]

**Evidence against it**:
- [What might suggest it's false]

**How to test it**:
- [Specific action to verify]

**If false, what would that explain?**:
- [How this being wrong causes the behavior]
```

### 4. Prioritize Testing
Rank by:
1. Lowest confidence
2. Highest explanatory power
3. Easiest to test

### 5. Execute Tests
For each assumption:
- Run the test
- Record result
- Update understanding

### 6. Synthesize
```
## Updated Understanding

### What I now know:
- [Confirmed facts]

### What was wrong:
- [Disproven assumptions]

### Root cause (if found):
- [The actual issue]

### Next steps:
- [What to try now]
```

## Common Assumption Traps

### "It worked before"
Code changes, dependencies update, environments differ.

### "The error message is accurate"
Errors often point to symptoms, not causes.

### "This code path is executing"
Add logging to verify. Silent failures are common.

### "The data looks right"
Print actual values. Type coercion and encoding cause issues.

### "The documentation is correct"
Libraries change, docs lag. Test actual behavior.

## Notes
- This is a thinking tool - take your time
- Writing clarifies thought
- Goal: find what you believe that isn't true
- If still stuck, ask for help with specific questions
