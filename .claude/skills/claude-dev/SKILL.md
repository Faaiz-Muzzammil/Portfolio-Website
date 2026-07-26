---
name: Claude Developer Expert
description: Expert knowledge and best practices for developing with Anthropic's Claude models.
---

# Claude Developer Expert

This skill provides best practices, code snippets, and prompting strategies for building applications with Anthropic's Claude models (3.5 Sonnet, 3.0 Opus, etc.).

## Prompt Engineering for Claude

### XML Tags
Claude is highly optimized for XML tags. Use them to structure your prompts clearly.
```xml
<instruction>Analyze the dataset below.</instruction>
<dataset>
...
</dataset>
```

### Chain of Thought
Ask Claude to "think step by step" inside `<thinking>` tags before outputting the final answer.
```
Please answer the user's question. First, think step by step in <thinking> tags to plan your response. Then provide the final answer in <answer> tags.
```

## Tool Use / Function Calling
Claude uses a specific format for tool use. Ensure your tool definitions are strict and descriptive.

### Example Tool Definition (TypeScript)
```typescript
{
  name: "get_weather",
  description: "Get the current weather for a location",
  input_schema: {
    type: "object",
    properties: {
      location: { type: "string", description: "City and state" }
    },
    required: ["location"]
  }
}
```

## System Prompts
Give Claude a distinct persona and role.
"You are an expert AI coding assistant specializing in Next.js and TailwindCSS..."

## Common Pitfalls
- **Over-apologizing**: Instruct Claude specifically "Do not apologize. Be concise."
- **Hallucination**: If asking for citations, tell Claude "If you do not know the answer, say so."
