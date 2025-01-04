import React, { useState } from "react";
import "./App.css";
import image from "../src/assets/img.png";
import axios from "axios";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [colors, setColors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePalette = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "https://color-palette-zozx.onrender.com/generate",
        {
          prompt,
        }
      );
      setColors(response.data); // Directly set the palette from response.data
    } catch (err) {
      console.error("Error generating palette:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(
          err.response.data.error || `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        setError("No response from server.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="logo">Color Palette Generator</div>
      <div className="body">
        <form onSubmit={generatePalette}>
          <input
            type="text"
            placeholder="Enter prompt (e.g., dark and modern)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Generate"}
          </button>
        </form>

        <div>
          {isLoading && <p>Loading palette...</p>}
          {error && <p style={{ color: "red" }}>Error: {error}</p>}
          {colors && colors.length > 0 && (
            <div className="palette" style={{ display: "flex", gap: "10px" }}>
              {" "}
              {/* Added flexbox for layout */}
              {colors.map((color, index) => (
                <div
                  key={index} // Use index as key if colors are unique
                  style={{
                    backgroundColor: color,
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                  }}
                ></div>
              ))}
            </div>
          )}
          {!isLoading && !error && (!colors || colors.length === 0) && (
            <p>No palette generated yet.</p>
          )}
        </div>

        {colors && colors.length > 0 && (
          <p>
            Generated {colors.length} colors: {colors.join(", ")}
          </p>
        )}
      </div>
      <div className="box">For an animal website</div>
      <div className="box2">Dark and modern</div>
      <div className="box3">Royal and simple</div>
      <div className="box4">Full moon and dark</div>
    </div>
  );
};

export default App;
