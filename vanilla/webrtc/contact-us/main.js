// main.js
const chatLog = document.getElementById("chat-log");
const chatInput = document.getElementById("chat-input");
const chatForm = document.getElementById("chat-form");

// Replace with your own session ID
const sessionId = "my-session-id";

const peerConnection = new RTCPeerConnection();

// Set up data channel for chat messages
const chatChannel = peerConnection.createDataChannel("chat");

chatChannel.onmessage = (event) => {
  const message = event.data;
  appendMessage(message);
};

// Set up ICE candidate exchange with signaling server
const signalingSocket = new WebSocket("wss://my-signaling-server.com");

signalingSocket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "offer") {
    peerConnection.setRemoteDescription(message.offer);
    peerConnection.createAnswer().then((answer) => {
      peerConnection.setLocalDescription(answer);
      signalingSocket.send(JSON.stringify({ type: "answer", answer }));
    });
  } else if (message.type === "answer") {
    peerConnection.setRemoteDescription(message.answer);
  } else if (message.type === "candidate") {
    peerConnection.addIceCandidate(message.candidate);
  }
};

// Send ICE candidates to signaling server
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    signalingSocket.send(
      JSON.stringify({ type: "candidate", candidate: event.candidate })
    );
  }
};

// Append chat message to log
function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Handle chat form submission
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = chatInput.value;
  appendMessage(`You: ${message}`);
  chatChannel.send(message);

  chatInput.value = "";
});
