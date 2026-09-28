# SmaranSaathi — AI Customer Support with Persistent Memory

> **"Instead of treating every support conversation as a fresh conversation, SmaranSaathi remembers what happened, what solved the problem, and how the customer prefers to be helped."**

SmaranSaathi is a persistent-memory customer support agent powered by **Hindsight long-term memory** and **Groq LLM** (`openai/gpt-oss-120b` / `qwen/qwen3-32b`).

---

## 🌟 Key Architecture & Separation of Concerns

| Layer | Responsibility | Storage |
| :--- | :--- | :--- |
| **Relational Database** | **"What happened"** — Historical support tickets, messages, customer profiles, ticket status, resolution summaries. | `backend/data/supportmemory.json` |
| **Hindsight Persistent Memory** | **"What the AI learned"** — Meaningful long-term customer memories: previous problems, verified successful fixes, customer preferences, and environmental quirks. | Isolated Memory Banks (`customer_${id}`) via Hindsight API (Port 8888) |
| **Groq LLM** | Response synthesis using model context that cleanly distinguishes Database history from Hindsight long-term memories. | Configurable via `GROQ_MODEL` and `GROQ_API_KEY` |
| **Dashboard UI** | Single active customer conversation view, Before vs After memory toggle, live Hindsight memory visualizer, ticket history, and observability drawer. | React 18 + TypeScript + Vite |

---

## 🚀 Quick Start

### 1. Start the Application
Run both backend (port 3001) and frontend (port 5173) with a single command:
```bash
npm run dev
```
Open your browser at **`http://localhost:5173`**.

---

## 🧠 Hindsight Memory Architecture

SmaranSaathi uses authentic Hindsight operations for:
1. **`recall`**: `POST /v1/default/banks/{bank_id}/memories/recall`
   - Surfaces high-relevance memories matching the customer query (BM25 + semantic concept score).
   - Also retrieves persistent communication preferences so style adapts automatically.
2. **`retain`**: `POST /v1/default/banks/{bank_id}/memories/retain`
   - AI evaluates interactions to extract meaningful long-term facts (successful solutions, repeated issues, preferences).
   - Trivial chat details are filtered out.
3. **Memory Isolation**: Each customer has a strictly isolated bank ID:
   - Rahul Sharma: `customer_cust_1`
   - Priya Mehta: `customer_cust_2`
   - Memories never cross or leak between customers.

### Running with Official Docker Hindsight
If you have Docker installed, you can run Vectorize's official Hindsight container:
```bash
docker run -it --name hindsight -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_API_KEY=$OPENAI_API_KEY \
  ghcr.io/vectorize-io/hindsight:latest
```
*Note: If Docker is not running, the application includes a standalone Hindsight REST API server implementing the exact `/v1/default/banks/:bankId/memories/...` endpoints on port 8888 so the system is immediately testable out of the box!*

---

## ⚡ Groq LLM Configuration

The backend is pre-configured to use Groq with the hackathon-recommended models:
- `openai/gpt-oss-120b` (Default)
- `qwen/qwen3-32b`

To enable live Groq API calls, set your API key in `backend/.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```
*If no API key is set, the application operates in an intelligent fallback engine mode, demonstrating the exact difference between "WITH HINDSIGHT" and "WITHOUT MEMORY" with high fidelity.*

---

## 🎯 Primary Demo Scenarios (Judge Walkthrough)

### 1. Returning Customer with Repeated Problem (Rahul Sharma)
- **Customer:** Rahul Sharma (`cust_1`).
- **Initial Ticket History:** Previous ticket `PAY-104` was resolved when Rahul corrected his billing address to `402 Lakeview Blvd`.
- **Customer message:** *"My payment is failing again."*
- **WITH HINDSIGHT:** The AI recalls the previous resolution and responds:
  > *"I remember your previous payment issue was resolved after correcting the billing address to match your card statement. Could you check whether the billing address on your corporate account is still accurate...?"*
- **WITHOUT MEMORY:** The AI treats Rahul like a new customer and asks generic questions:
  > *"I'm sorry to hear that your payment is failing. Could you provide the error code, payment method, or contact your bank...?"*

### 2. Preference Learning & Adaptive Pacing
- **Customer:** Rahul says: *"Please give me instructions one step at a time."*
- **Retention:** Hindsight retains: `Rahul Sharma prefers step-by-step instructions presented one sequential action at a time.`
- **Subsequent Interaction:** Rahul asks: *"How do I upgrade my plan?"*
- **Personalized Response:** AI adapts to his preference:
  > *"As you prefer one step at a time: Step 1: Click on your avatar at the top right and select Organization Settings. Let me know once you're on that page and we will proceed to Step 2!"*

### 3. Customer Isolation Test
- Switch from **Rahul Sharma** to **Priya Mehta** (`cust_2`).
- Ask Priya: *"My payment is failing."*
- Notice that `recalledMemories` is 0 and Rahul's billing address is **never** mentioned. Priya's bank is `customer_cust_2`.

### 4. Error Handling & Graceful Degradation
- If the Hindsight service is unavailable, the UI clearly displays:
  > `⚠️ Hindsight service unavailable: memories could not be retrieved.`
- The AI still provides a standard response using the active ticket without crashing.

---

## 📊 Observability / AI Inspector

Click the **AI Inspector** button in the header at any time to inspect:
- Exactly which memories were recalled and their relevance scores.
- The raw prompt context passed to the LLM (verifying the separation of Database history vs Hindsight memory).
- Execution latency in milliseconds.
- Retention decisions made by the memory extractor.
