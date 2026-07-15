# Technical Specification - AI Embeddings & RAG (Embedding Spec)

## 1. Contextual RAG in AI Chat
*   To enable high-quality agricultural guidance, the chat queries are processed through Retrieval-Augmented Generation (RAG) on the backend:
    1.  The user's query is vectorized into dense embeddings.
    2.  The vector database is queried to fetch relevant documentation chunks (e.g. rice cultivation handbooks, pest treatment manuals).
    3.  These context chunks are injected into the LLM system prompt alongside the user message.
    4.  The model outputs factual, locally-relevant advice stream to the mobile application via SSE.
