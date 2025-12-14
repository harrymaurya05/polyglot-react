import React from "react";

const spinnerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  gap: "1rem",
};

const spinnerCircle: React.CSSProperties = {
  width: "50px",
  height: "50px",
  border: "5px solid #f3f3f3",
  borderTop: "5px solid #3498db",
  borderRadius: "50%",
  animation: "polyglot-spin 1s linear infinite",
};

const keyframes = `
  @keyframes polyglot-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const DefaultLoadingComponent: React.FC = () => {
  return (
    <>
      <style>{keyframes}</style>
      <div style={spinnerStyle}>
        <div style={spinnerCircle} />
        <p>Loading translations...</p>
      </div>
    </>
  );
};
