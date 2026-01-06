from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class UserProfile(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    sleep_quality: int = 5  # 1-10
    energy_level: int = 5  # 1-10
    attention_stability: int = 5  # 1-10
    anxiety_tendency: int = 5  # 1-10
    physical_activity: str = "sedentary"  # sedentary, light, moderate, active
    learning_goals: List[str] = []
    social_confidence: int = 5  # 1-10
    daily_time_available: int = 60  # minutes
    level: str = "beginner"  # beginner, intermediate, advanced

class ProtocolRequest(BaseModel):
    profile: UserProfile
    module: str  # physical, cognitive, regulation, social, systems
    context: Optional[str] = None
    recent_data: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    profile: UserProfile
    module: str
    session_id: str

# AI Coach System Prompts
SYSTEM_PROMPTS = {
    "physical": """You are an elite physical performance coach within MAXIM, a personal performance operating system. 
Your role is to provide evidence-based, sustainable physical training guidance.

Principles:
- Prioritize longevity over intensity
- Focus on compound movements and functional fitness
- Emphasize recovery and nervous system regulation
- Adapt to user's current capacity and fatigue levels
- Never push beyond safe limits
- Use progressive overload wisely

Provide specific, actionable protocols. Be calm, professional, and direct. No hype or motivational fluff.
Format responses as clear action items when providing protocols.""",

    "cognitive": """You are an elite cognitive performance coach within MAXIM, a personal performance operating system.
Your role is to optimize focus, learning speed, and thinking clarity.

Principles:
- Protect deep work time ruthlessly
- Use spaced repetition and active recall
- Break complex topics into atomic concepts
- Build knowledge graphs and connections
- Recognize attention patterns and optimize accordingly
- Balance learning load to prevent burnout

Provide specific focus blocks, learning strategies, and cognitive protocols. Be direct and systematic.""",

    "regulation": """You are an elite mental regulation coach within MAXIM, a personal performance operating system.
Your role is to help users control anxiety, overthinking, and impulsivity.

Principles:
- Nervous system regulation through breath
- Externalize thoughts to reduce mental load
- Convert rumination into action
- Build stress resilience gradually
- Use evidence-based techniques (box breathing, physiological sighs, etc.)
- Track patterns without judgment

Provide calming, grounded protocols. Be steady and reassuring without being soft.""",

    "social": """You are an elite social intelligence coach within MAXIM, a personal performance operating system.
Your role is to build calm confidence, communication clarity, and trust.

Principles:
- Confidence comes from competence
- Practice response delay and active listening
- Build anxiety tolerance through gradual exposure
- Focus on authenticity over performance
- Develop clear boundaries and assertiveness
- Track social progress without comparison to others

Provide practical social exercises and reflection prompts. Be supportive but not soft.""",

    "systems": """You are an elite systems architect within MAXIM, a personal performance operating system.
Your role is to replace motivation with reliable systems.

Principles:
- Identity-based habits over outcome-based
- Remove friction for good behaviors
- Add friction for bad behaviors
- Simplify when overwhelmed
- Track systems, not just goals
- Regular review and pruning

Provide systematic approaches to consistency. Be analytical and strategic."""
}

# Helper function to generate AI response
async def generate_ai_response(prompt: str, module: str, session_id: str) -> str:
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=SYSTEM_PROMPTS.get(module, SYSTEM_PROMPTS["systems"])
        ).with_model("gemini", "gemini-2.5-flash")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        return response
    except Exception as e:
        logging.error(f"AI generation error: {e}")
        return f"I'm currently unable to generate a personalized response. Please try again later."

@api_router.get("/")
async def root():
    return {"message": "MAXIM Performance API", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "ai_enabled": bool(EMERGENT_LLM_KEY)}

@api_router.post("/generate-protocol")
async def generate_protocol(request: ProtocolRequest):
    """Generate personalized protocol based on user profile and module"""
    profile = request.profile
    module = request.module
    
    # Build context prompt
    prompt = f"""Generate a personalized {module} protocol for this user:

Profile:
- Level: {profile.level}
- Energy: {profile.energy_level}/10
- Sleep Quality: {profile.sleep_quality}/10
- Attention: {profile.attention_stability}/10
- Anxiety Tendency: {profile.anxiety_tendency}/10
- Activity Level: {profile.physical_activity}
- Daily Time Available: {profile.daily_time_available} minutes
- Social Confidence: {profile.social_confidence}/10

{f'Additional Context: {request.context}' if request.context else ''}
{f'Recent Data: {request.recent_data}' if request.recent_data else ''}

Provide:
1. Today's recommended protocol (specific actions)
2. Key focus area
3. Warning signs to watch for
4. Adjustment recommendations based on their current state

Keep response concise and actionable."""
    
    session_id = f"protocol-{module}-{uuid.uuid4().hex[:8]}"
    response = await generate_ai_response(prompt, module, session_id)
    
    return {
        "module": module,
        "protocol": response,
        "generated_at": datetime.utcnow().isoformat(),
        "session_id": session_id
    }

@api_router.post("/chat")
async def chat_with_coach(request: ChatRequest):
    """Interactive chat with AI coach"""
    profile = request.profile
    
    prompt = f"""User Profile Context:
- Level: {profile.level}
- Energy: {profile.energy_level}/10
- Current State: {profile.physical_activity} activity

User Message: {request.message}

Respond as their {request.module} coach. Be direct, helpful, and specific."""
    
    response = await generate_ai_response(prompt, request.module, request.session_id)
    
    return {
        "response": response,
        "module": request.module,
        "timestamp": datetime.utcnow().isoformat()
    }

@api_router.post("/daily-briefing")
async def generate_daily_briefing(profile: UserProfile):
    """Generate comprehensive daily briefing across all modules"""
    prompt = f"""Generate a concise daily briefing for this user:

Profile:
- Level: {profile.level}
- Energy: {profile.energy_level}/10
- Sleep: {profile.sleep_quality}/10
- Attention: {profile.attention_stability}/10
- Anxiety: {profile.anxiety_tendency}/10
- Time Available: {profile.daily_time_available} minutes

Provide ONE action item for each domain:
1. PHYSICAL: One movement/exercise action
2. COGNITIVE: One focus/learning action
3. REGULATION: One mental/emotional action
4. SOCIAL: One optional social action
5. SYSTEM: One habit/routine check

Format as a clean checklist. Be specific and realistic for their time/energy."""
    
    session_id = f"briefing-{uuid.uuid4().hex[:8]}"
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message="You are MAXIM, a calm elite performance coach. You provide clear, minimal daily protocols. No fluff. No hype. Just effective action items."
    ).with_model("gemini", "gemini-2.5-flash")
    
    try:
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        return {
            "briefing": response,
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logging.error(f"Briefing generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate briefing")

@api_router.post("/weekly-review")
async def generate_weekly_review(profile: UserProfile, week_data: Dict[str, Any] = None):
    """Generate weekly system review"""
    prompt = f"""Generate a weekly system review for this user:

Profile:
- Level: {profile.level}
- Average Energy: {profile.energy_level}/10
- Average Sleep: {profile.sleep_quality}/10

Week Data: {week_data or 'No data provided'}

Provide:
1. What's working well (keep doing)
2. What needs adjustment
3. What to remove/simplify
4. Focus for next week
5. System health score estimate (1-10)

Be analytical, not emotional. Focus on systems, not motivation."""
    
    session_id = f"review-{uuid.uuid4().hex[:8]}"
    response = await generate_ai_response(prompt, "systems", session_id)
    
    return {
        "review": response,
        "week_ending": datetime.utcnow().strftime("%Y-%m-%d"),
        "generated_at": datetime.utcnow().isoformat()
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
