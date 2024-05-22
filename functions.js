const axios = require("axios");
const messages = require("./messages.json");
const AppError = require("./errors/AppError.js")
 
const callAIService = async (obj) => {
  try {
    
    const response = await axios.post(
      "https://ai-assistant-svc-phase-two.azurewebsites.net/api/ai/sendmessage",
      obj
    );
    
    if (response.status == 200 && response.data && response.data.res) {
      return response.data.res;
    } else {
      throw new AppError(messages.EMPTY_RESPONSE_MESSAGE);
    }
  } catch (error) {
    const statusCode = error.response.status;
    if (statusCode === 400) {
      throw new AppError(messages.INVALID_REQUEST_MESSAGE);
    } else {
      throw new AppError(messages.GENERIC_ERROR_MESSAGE);
    }
  }
};
 
const extractMessageDetails = async (context) => {
  // create an object to store the message details
  const obj = {};
  try {
    const imageExtensions = ["jpeg", "jpg", "png"];
    const attachments = context.activity.attachments;
    obj.sessionId = context.activity.conversation.id;
 
    // if the activity has text, add it to the object
    if (context.activity.text) {
      obj.messageText = context.activity.text;
    }
 
    if (attachments && attachments[0].contentType !== "text/html") {
      // check if the attachment is an image
      if (
        attachments[0].contentType ===
          "application/vnd.microsoft.teams.file.download.info" &&
        imageExtensions.includes(attachments[0].content.fileType)
      ) {
        const url = context.activity.attachments[0].content.downloadUrl;
        if (url) {
          const imageBuffer = await axios.get(url, {
            responseType: "arraybuffer",
          });
          obj.imageBuffer = imageBuffer.data;
        }
      } else {
        // if the attachment is not an image, send an error message
        throw new AppError(messages.INVALID_FILE_TYPE_ERROR);
        
      }
    }

    if (!obj.messageText && !obj.imageBuffer) {
      throw new AppError(messages.NO_MESSAGE_ERROR);
    }
    return obj;
  } catch (error) {
    console.log(error);
    throw new AppError(messages.MessageDetailsFetchingError);
  }
};
 
// const getRequestRecievedMessage = (messageDetails) => {
//   if (
//     messageDetails &&
//     messageDetails.messageText &&
//     messageDetails.imageBuffer
//   ) {
//     return messages.IMAGE_TEXT_REQUEST_RECEIVED_MESSAGE;
//   } else if (messageDetails && messageDetails.messageText) {
//     return messages.TEXT_REQUEST_RECEIVED_MESSAGE;
//   } else if (messageDetails && messageDetails.imageBuffer) {
//     return messages.IMAGE_REQUEST_RECEIVED_MESSAGE;
//   } else {
//     return messages.NO_IMGAGE_TEXT_FOUND_MESSAGE;
//   }
// };
 
module.exports = {
  callAIService,
  extractMessageDetails
};