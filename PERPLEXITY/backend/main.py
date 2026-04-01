from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

app = FastAPI()

# Allow CORS so the frontend can query the API directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Gemini Client as per the plan
try:
    client = genai.Client(api_key="AIzaSyDcDTGN7ASbSy1_ALgkHKD8NO30Vds--XQ")
except Exception as e:
    client = None
    print("Warning: Failed to initialize Google GenAI Client. Error:", e)

class ChatRequest(BaseModel):
    prompt: str

@app.post("/chat")
def chat_with_gemini(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized.")
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=request.prompt,
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini generation error: {str(e)}")
