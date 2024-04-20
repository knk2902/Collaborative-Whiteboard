import React from 'react';

const UserCursor: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  return <div style={{ position: 'absolute', left: x, top: y }}>Cursor</div>;
};

export default UserCursor;
