# Veyra Open-Source AI API Specification (`/api/ai/chat`)

**Version**: 1.0.0  
**Target Clients**: Veyra Web Application, Veyra Mobile Application (iOS & Android)

---

## 1. Overview
The Veyra AI Chat API exposes a unified, platform-independent endpoint to query self-hosted open-source Language Models (e.g. Qwen 2.5 3B, Llama 3, Mistral) via Ollama, vLLM, or LocalAI inference backends.

The frontend (Web/Mobile) communicates **ONLY** with this endpoint and **NEVER** connects directly to model servers or exposes credentials.

---

## 2. Endpoint Details

- **Path**: `/api/ai/chat`
- **Method**: `POST`
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer <user_token>` *(or `X-Veyra-User-Id: <user_id>`)*

---

## 3. Request Payload Schema

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What should I eat for dinner tonight?"
    }
  ],
  "userContext": {
    "user": {
      "name": "Sarah Connor",
      "firstName": "Sarah",
      "email": "sarah@veyra.app",
      "goal": "Lose Weight",
      "age": 29,
      "heightCm": 170,
      "weightKg": 65,
      "targetWeightKg": 60,
      "activityLevel": "moderate",
      "dietaryPreferences": ["High Protein"],
      "allergens": ["Peanuts"]
    },
    "nutrition": {
      "dailyCalories": 1900,
      "caloriesConsumed": 1200,
      "caloriesRemaining": 700,
      "dailyProtein": 120,
      "proteinConsumed": 80,
      "proteinRemaining": 40,
      "dailyCarbs": 210,
      "carbsConsumed": 140,
      "carbsRemaining": 70,
      "dailyFat": 60,
      "fatConsumed": 42,
      "fatRemaining": 18,
      "waterLiters": 1.8,
      "waterTarget": 2.5
    },
    "recentMeals": [
      { "name": "Oatmeal with Berries", "calories": 300, "protein": 12 },
      { "name": "Grilled Chicken Salad", "calories": 450, "protein": 45 }
    ],
    "scannedProduct": null,
    "activeWorkout": null
  }
}
```

---

## 4. Response Payload Schema

### Success Response (`200 OK`)
```json
{
  "message": "Hi Sarah! With 700 kcal and 40g of protein remaining today, a grilled salmon filet with roasted asparagus and quinoa would fit your Lose Weight goal while easily hitting your protein target.",
  "text": "Hi Sarah! With 700 kcal and 40g of protein remaining today, a grilled salmon filet with roasted asparagus and quinoa would fit your Lose Weight goal while easily hitting your protein target.",
  "conversationId": "conv_1771622400000",
  "provider": "qwen2.5:3b (via Veyra Backend)",
  "timestamp": "10:15 PM",
  "usage": {
    "promptTokens": 320,
    "completionTokens": 54
  }
}
```

### Service Unavailable Response (`503 Service Unavailable`)
Returned when the open-source LLM server (Ollama/vLLM) is starting, offline, or unreachable.
```json
{
  "isUnavailable": true,
  "error": "AI service unavailable. Open-source LLM model server is offline.",
  "provider": "veyra-backend (unavailable)"
}
```

---

## 5. Mobile Integration Guidelines (React Native / Flutter / Swift)
Mobile apps call the exact same endpoint:
```typescript
const response = await fetch('https://your-veyra-backend.app/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userSessionToken}`,
  },
  body: JSON.stringify({
    messages: conversationHistory,
    userContext: context,
  }),
});
```
