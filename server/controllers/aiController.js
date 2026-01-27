 

// const axios = require('axios'); 

// exports.generateSop = async (req, res) => {
//   try {
//     const { prompt } = req.body;
//     
//     console.log("-> Starting OpenRouter request...");

//     // 1. Define the Request Payload
//     const payload = {
//       model: "openai/gpt-4o-mini", 
//       messages: [
//         { 
//           role: "system", 
//           content: "You are a professional Japanese Immigration Scrivener. You must output a JSON object containing only two keys: 'english' and 'japanese'. DO NOT include any markdown (like ```json) or commentary." 
//         }, 
//         { 
//           role: "user", 
//           content: prompt 
//         }
//       ],
//       response_format: { type: "json_object" }, 
//       max_tokens: 1000
//     };

//     // 2. Call the OpenRouter API endpoint (FIXED URL)
//     const response = await axios.post(
//       '[https://openrouter.ai/api/v1/chat/completions](https://openrouter.ai/api/v1/chat/completions)', 
//       payload,
//       {
//         headers: { 
//           'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 
//           'Content-Type': 'application/json' 
//         }
//       }
//     );

//     // 3. Extract and parse the response
//     const generatedText = response.data.choices[0].message.content;
//     
//     let jsonResponse;
//     try {
//         jsonResponse = JSON.parse(generatedText);
//     } catch (parseError) {
//         console.error("!!! JSON PARSING FAILED !!! Error:", parseError.message);
//         return res.status(500).json({ 
//             message: "Server Error: AI did not return clean JSON.", 
//             details: parseError.message
//         });
//     }

//     // Success: Return the parsed JSON object to the frontend
//     return res.status(200).json({ text: jsonResponse }); // <-- Added 'return' here for safety

// } catch (error) {
//     // If the error doesn't have a response property, set status to 500
//     const status = error.response ? error.response.status : 500; 
//     
//     console.error('OpenRouter API/Execution Error:', error.response ? error.response.data : error.message);
//     
//     // FIX: Send the response only once and return to prevent the secondary error
//     return res.status(status).json({ 
//         message: "Server Execution Failed", 
//         error: error.message,
//         details: error.response?.data
//     });
// }
// };

const axios = require('axios'); 

exports.generateSop = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    console.log("-> Starting OpenRouter request...");

    const payload = {
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional Japanese Immigration Scrivener. You must output a JSON object containing only two keys: 'english' and 'japanese'. DO NOT include any markdown (like ```json) or commentary.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    };

    // FIXED URL HERE
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText = response.data.choices[0].message.content;

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(generatedText);
    } catch (parseError) {
      console.error("!!! JSON PARSING FAILED !!! Error:", parseError.message);
      return res.status(500).json({
        message: "Server Error: AI did not return clean JSON.",
        details: parseError.message,
      });
    }

    return res.status(200).json({ text: jsonResponse });

  } catch (error) {
    const status = error.response ? error.response.status : 500;

    console.error(
      "OpenRouter API/Execution Error:",
      error.response ? error.response.data : error.message
    );

    return res.status(status).json({
      message: "Server Execution Failed",
      error: error.message,
      details: error.response?.data,
    });
  }
};
