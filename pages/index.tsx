import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import { useDropzone } from "react-dropzone";

interface StructuredData {
  [key: string]: any;
}

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [structuredData, setStructuredData] = useState<StructuredData[]>([]);

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

      const urls = files.map((file) => URL.createObjectURL(file));
      setImageURLs((prevURLs) => [...prevURLs, ...urls]);
    }
  };

  // Handle drag-and-drop file selection
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);

    const urls = acceptedFiles.map((file) => URL.createObjectURL(file));
    setImageURLs((prevURLs) => [...prevURLs, ...urls]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: true,
  });

  // Handle form submission
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select one or more image files.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
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
      imageURLs.forEach((url) => URL.revokeObjectURL(url));
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
        <div
          {...getRootProps()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #888",
            padding: "20px",
            width: "500px",
            height: "200px",
            textAlign: "center",
            marginBottom: "20px",
            cursor: "pointer",
            backgroundColor: isDragActive ? "#f0f8ff" : "#f9f9f9",
            borderRadius: 5,
          }}
        >
          <input
            {...getInputProps()}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
          {isDragActive ? (
            <p
              style={{
                width: "70%",
                margin: 0,
              }}
            >
              Drop the files here...
            </p>
          ) : (
            <p
              style={{
                width: "70%",
                margin: 0,
              }}
            >
              Drag & drop some files here, or click to select files
            </p>
          )}
        </div>
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
          {imageURLs.map((url, index) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
              key={index}
            >
              <button
                onClick={() => {
                  let currentFiles = [...selectedFiles];
                  let currentUrls = [...imageURLs];

                  currentUrls.splice(index, 1);
                  currentFiles.splice(index, 1);

                  setSelectedFiles(currentFiles);
                  setImageURLs(currentUrls);
                }}
                style={{ position: "absolute", left: 10, top: 10 }}
              >
                Delete
              </button>
              <img
                src={url}
                alt={`Selected ${index}`}
                style={{ maxWidth: "200px" }}
              />
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
