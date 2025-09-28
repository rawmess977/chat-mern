import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeMail = async(email, name, clientURL)=>{

    if (!sender?.email || !sender?.name ){
      throw new Error("Email sender configuration missing")
    }

    if(!email) throw new Error("Recipient email is required")
    if(!clientURL) throw new Error("ClientURl is required is required")

    const { data, error } = await resendClient.emails.send({
    from: `${sender.name } <${sender.email}>`,
    to: email,
    subject: `Welcome to chat-mern ${name}`,
    html: `${createWelcomeEmailTemplate(sender.name, clientURL)}`,
    
  });

   if (error) {
    return console.error({ error });
  }

  console.log({ data });
}