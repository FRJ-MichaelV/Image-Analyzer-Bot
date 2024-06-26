const {
  TurnContext,
  MessageFactory,
  TeamsActivityHandler,
  ActivityTypes,
} = require("botbuilder");
 
const axios = require("axios");
const messages = require("./messages.json");
const {
  callAIService,
  extractMessageDetails,
} = require("./functions");
const AppError = require("./errors/AppError.js");
class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();
 
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          // Send a welcome message to the user
          // await context.sendActivities([
          //   { type: ActivityTypes.Message, text: messages.WELLCOME_MESSAGE },
          // ]);
          await context.sendActivities([
            { type: "delay", value: 2000 },
            { type: ActivityTypes.Message, text: messages.WELLCOME_MESSAGE },
          ]);

          //await context.sendActivity(messages.WELLCOME_MESSAGE);

          await next();
        }
      }
    });

 
    this.onMessage(async (context, next) => {
      try {
        // remove the recipient mention from the message
        TurnContext.removeRecipientMention(context.activity);
        // get the message details  
        const messageDetails = await extractMessageDetails(context);
        
        const response = await callAIService(messageDetails);
        await context.sendActivity(response);
        
      } catch (error) {
        console.log(error);
        let errorMessage = messages.GENERIC_ERROR_MESSAGE;
        if (error instanceof AppError) {
          errorMessage = error.message;
        }
        await context.sendActivities([
          { type: "delay", value: 2000 },
          { type: ActivityTypes.Message, text: errorMessage },
        ]);
      }
      finally {
        await next();
      }
      
    });

  }
}
 
module.exports.TeamsBot = TeamsBot;