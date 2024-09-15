// pages/api/process-image.ts
import formidable, { Files, File as FormidableFile } from "formidable";
import { promises as fs } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const AI_KEY: any = process.env.AI_KEY;
const genAI = new GoogleGenerativeAI(AI_KEY);

const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

type FormidableFileArray = FormidableFile | FormidableFile[] | undefined;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const form = formidable();

      form.parse(
        req,
        async (err: any, fields: formidable.Fields, files: Files) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: "Error parsing the uploaded files" });
            return;
          }

          let fileArray = files.file as FormidableFileArray;
          if (!Array.isArray(fileArray)) {
            fileArray = [files.file as FormidableFile];
          }

          const results: { result?: string; error?: string }[] = [];

          for (const file of fileArray) {
            try {
              const filepath = file?.filepath || file?.path;
              if (!filepath) {
                console.error("File path is undefined");
                res.status(500).json({ error: "File path is undefined" });
                return;
              }

              const fileData = await fs.readFile(filepath);
              const base64Data = fileData.toString("base64");
              const mimeType = file.mimetype;

              // Prepare the image data for the API
              const image = {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              };

              const prompt =
                "In JSON format (without returning ```json```), please send back the data that you see in the image. Please do not include values that are partially cut off. If there are values like this '13.4K', please return them like this 13,400. For areas that have an icon and a metric below it, make sure to label it accordingly, for example, if there's a heart icon and a 143 number below, that would be the key of 'likes' and value of '143'";

              // Call the Google Generative AI API
              const result = await model.generateContent([prompt, image]);

              // Collect the result
              results.push({ result: result.response.text() });
            } catch (error) {
              console.error(error);
              results.push({
                error: "Something went wrong processing this image",
              });
            }
          }

          // Send all results back to the client
          res.status(200).json({ results });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else {
    res.status(400).json({ error: "Bad request" });
  }
}
