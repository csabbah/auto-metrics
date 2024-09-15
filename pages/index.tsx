import { useState, useEffect, ChangeEvent, FormEvent } from "react";

interface StructuredData {
  [key: string]: any;
}

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);

  // Handle file selection
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [structuredData, setStructuredData] = useState<StructuredData[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(files);

      const urls = files.map((file) => URL.createObjectURL(file as any));
      setImageURLs(urls);
    }
  };

  // Handle form submission
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select one or more image files.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    selectedFiles.forEach((file: any) => {
      formData.append("file", file);
    });

    try {
      const response = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setStructuredData(data.results);
    } catch (error) {
      console.error("Error processing images:", error);
      alert("There was an error processing your images.");
    } finally {
      setLoading(false);
    }
  };

  // Function to render data recursively
  const renderData = (data: StructuredData) => {
    return (
      <ul
        style={{
          maxWidth: 250,
        }}
      >
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong>{" "}
            {value && typeof value === "object" ? renderData(value) : value}
          </li>
        ))}
      </ul>
    );
  };

  useEffect(() => {
    return () => {
      imageURLs.forEach((url: string) => URL.revokeObjectURL(url));
    };
  }, [imageURLs]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 50,
      }}
    >
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <button type="submit">Process Images</button>
      </form>
      {imageURLs.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",

            justifyContent: "center",
            alignItems: "center",
            gap: 25,
          }}
        >
          {imageURLs.map((url: string, index: number) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
              key={index}
            >
              <img
                src={url}
                alt={`Selected ${index}`}
                style={{ maxWidth: "200px" }}
              />
              {/* Display extracted data if available */}
              {structuredData.length > index &&
                renderData(structuredData[index])}
            </div>
          ))}
        </div>
      )}
      {loading && <p>Processing...</p>}
    </div>
  );
}
