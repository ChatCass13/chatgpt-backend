import express from "express"; //calling on the express info package
import fetch from "node-fetch"; //calling on the node-fetch package
import cors from "cors"; //Import cors package

const app = express(); //Create an app that's an express server
const port = 3000; //Port number

//Middleware to enable CORS
app.use(cors());

//Middleware to parse JSON bodies
app.use(express.json());

//Route to handle POST requests from frontend
app.post("/api/chatgpt", async (req, res) => { //Create a route to handle POST requests from the frontend (the visible bit) to the backend (the hidden bit) 
  const prompt = `start every response with "hello Cassandra" and explain the answer to all my questions like I'm a junior programmer learning to code. Please keep responses simple and direct.`; // Prompt to start the conversation - personalized
const userMessage = req.body.message ? req.body.message.trim() : ''; // Ensure the message is not empty
const message = `${prompt} ${userMessage}`; // Combine the prompt and user message
  const apiKey = "sk-proj-qjdfEVnUUjOIoLxXA1YkT3BlbkFJvZZWqBH2n7iijswi1GRk"; //My OpenAI API key
  const apiUrl = "https://api.openai.com/v1/chat/completions"; //Endpoint to send the message to OpenAI (chatGPT)

  try {
    const response = await fetch(apiUrl, { //Send a POST request to OpenAI API
      method: "POST", //POST method is used to generate completions
      headers: {
        "Content-Type": "application/json", //Send and receive data in JSON format from the API
        Authorization: `Bearer ${apiKey}`//Autorisation key to access the API
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", //Model to use of chatGPT
        messages: [ //Messages to send to the model
          {
            role: "user", //who's sending the message
            content: message //Message to send
          }
        ],
        max_tokens: 150 //Maximum number of tokens to generate
      })
    });

    if (!response.ok) { //If the response is very much not ok
      const errorData = await response.json(); //if there's an error, get the error data
      console.error("Error from OpenAI:", errorData); //log the error data to the console
      throw new Error(`Error from OpenAI: ${errorData.error.message}`); //send an error message with the error data
    }

    const data = await response.json(); //Get the response data from the API (if it's ok)
    console.log("Response from OpenAI:", data); //Log the response data to the console from the API

    if (!data.choices || !data.choices[0] || !data.choices[0].message) { //If the response is not as expected (no choices, no message) 
      throw new Error("Unexpected response format from OpenAI"); //If the response is not as expected, show an error message to the console
    }

    const chatGptResponse = data.choices[0].message.content.trim(); //Get the response from the API and remove any extra spaces from the response

    res.json({message: chatGptResponse}); //Send the response to the frontend (the visitble bit) as a JSON response
  } catch (error) { //If there's an error
    console.error("Error:", error.message); //Log the error message to the console
    res.status(500).json({error: "Internal Server Error"}); //Send an error message to the frontend as a JSON response with a status code of 500
  }
});

app.listen(port, () => { //Start the server and listen on the port number defined at the top of the file (3000 in this instance)
  console.log(`Server is running at http://localhost:${port}`); //Log a message to the console to show the server is running and the port number it's running on
});
