---
name: Gemini Developer Expert
description: Expert knowledge and best practices for developing with Google's Gemini models.
---

# Gemini Developer Expert

This skill provides best practices for utilizing Google's Gemini 1.5 Pro and Flash models in development.

## Multimodal Capabilities
Gemini excels at understanding video, audio, and large context windows.

### Long Context
Gemini 1.5 Pro supports up to 2M tokens. You can feed entire codebases or books.
- **Tip**: When passing large context, put the *instructions* at the END of the prompt for better adherence (Recency Bias).

## Structured Output (JSON Mode)
Gemini has a native JSON mode.
```python
model = GenAI.GenerativeModel('gemini-1.5-pro')
response = model.generate_content(
    'List 3 cookie recipes',
    generation_config={'response_mime_type': 'application/json'}
)
```

## Prompting Strategies
### Details Matter
Gemini performs best with highly detailed, specific instructions compared to potential ambiguity.

### Safety Settings
Be aware of default safety settings which may block benign content. Adjust `HarmCategory` thresholds if necessary for creative writing apps.

## Function Calling
Gemini supports automatic function calling.
- Ensure descriptions are verbose.
- Use `enable_automatic_function_calling=True` in SDKs.

## Vertex AI vs AI Studio
- **AI Studio**: Faster for prototyping, free tier available.
- **Vertex AI**: Enterprise-grade, requires GCP project, offers more data governance.
