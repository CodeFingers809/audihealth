import os
import numpy as np
import tensorflow as tf
from flask import Blueprint, request, jsonify
from typing import List, Dict
from app import client

system_prompt = {
    "role": "system",
    "content": (
        "You are AudiBuddy, an AI expert in voice and vocal health. You provide professional advice "
        "on vocal health, vocal exercises, speech disorders, and voice-related medical conditions. "
        "You do NOT respond to unrelated topics. If asked about anything outside your expertise, politely "
        "refuse to answer and redirect the user to vocal health topics."
    )
}

audio_bp = Blueprint("audio", __name__)

class AudiBuddy:
    def __init__(self, api_key: str):
        """Initialize AudiBuddy with API key and system prompt."""
        self.client = Groq(api_key=api_key)
        self.system_prompt = {
            "role": "system",
            "content": (
                "You are AudiBuddy, an AI expert in voice and vocal health. You provide professional advice "
                "on vocal health, vocal exercises, speech disorders, and voice-related medical conditions. "
                "You do NOT respond to unrelated topics. If asked about anything outside your expertise, politely "
                "refuse to answer and redirect the user to vocal health topics. "
                "Always maintain context of the previous conversation to provide more relevant and personalized responses."
            )
        }
        self.conversation_history: List[Dict[str, str]] = [self.system_prompt]
        self.max_history = 10  # Maximum number of message pairs to keep in context

    def trim_conversation_history(self):
        """Maintain conversation history within limits while preserving context."""
        if len(self.conversation_history) > (self.max_history * 2 + 1):  # +1 for system prompt
            # Keep system prompt and last N message pairs
            self.conversation_history = [
                self.system_prompt,
                *self.conversation_history[-(self.max_history * 2):]
            ]

    def get_response(self, user_input: str) -> str:
        """Get response from Groq API while maintaining conversation context."""
        self.conversation_history.append({"role": "user", "content": user_input})
        self.trim_conversation_history()

        completion = self.client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=self.conversation_history,
            temperature=1,
            max_completion_tokens=1024,
            top_p=1,
            stream=False,  # Set to False for API response
            stop=None,
        )

        response_text = completion.choices[0].message.content
        self.conversation_history.append({"role": "assistant", "content": response_text})
        return response_text

@audio_bp.route("/chat", methods=["POST"])
def chat():
    """Flask route to handle chatbot conversation."""
    data = request.json
    user_input = data.get("message", "").strip()

    if not user_input:
        return jsonify({"error": "Message cannot be empty"}), 400

    # Initialize conversation history
    conversation = [system_prompt]
    conversation.append({"role": "user", "content": user_input})

    # Call Groq API
    completion = client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=conversation,
        temperature=1,
        max_completion_tokens=1024,
        top_p=1
    )

    # Get response
    response_text = completion.choices[0].message.content

    return jsonify({"response": response_text})