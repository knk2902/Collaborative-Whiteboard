// JoinSession.tsx
import React, { useState } from "react";

const JoinSession: React.FC = () => {
  const [sessionId, setSessionId] = useState("");

  const handleJoinSession = () => {
    // Logic to join existing whiteboard session with sessionId
    console.log("Joining session:", sessionId);
  };

  return (
    <div>
      <h2>Join Existing Session</h2>
      <input
        type="text"
        placeholder="Enter Session ID"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
      />
      <button onClick={handleJoinSession}>Join Session</button>
    </div>
  );
};

export default JoinSession;
