import base64
import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pycryptodome.Cipher import AES

app = FastAPI()

key = b'Sixteen byte key'

clients = set()

def encrypt_message(message):
    cipher = AES.new(key, AES.MODE_EAX)
    nonce = cipher.nonce
    ciphertext, tag = cipher.encrypt_and_digest(message.encode())
    return base64.b64encode(nonce + ciphertext).decode()

def decrypt_message(encrypted_message):
    decoded = base64.b64decode(encrypted_message)
    nonce = decoded[:16]
    ciphertext = decoded[16:]
    cipher = AES.new(key, AES.MODE_EAX, nonce=nonce)
    return cipher.decrypt(ciphertext).decode()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    try:
        while True:
            encrypted_data = await websocket.receive_text()
            decrypted_message = decrypt_message(encrypted_data)
            
            print(f"Received: {decrypted_message}")
            
            encrypted_response = encrypt_message(f"Server: {decrypted_message}")
            
            for client in clients:
                await client.send_text(encrypted_response)
    except WebSocketDisconnect:
        print("Client disconnected")
        clients.remove(websocket)
