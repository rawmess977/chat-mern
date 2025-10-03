import {aj} from '../lib/arcjet.js'
import { isSpoofedBot } from "@arcjet/inspect";



export const arcjetProtection = async(req,res,next) =>{
  try {
    const decision = await aj.protect(req, { requested: 5 }); // Deduct 5 tokens from the bucket
    

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({message: "Rate limit exceeded. Pleases try again later."})
        // res.writeHead(429, { "Content-Type": "application/json" });
        // res.end(JSON.stringify({ error: "Too Many Requests" }));
      } else if (decision.reason.isBot()) {
        // res.writeHead(403, { "Content-Type": "application/json" });
        // res.end(JSON.stringify({ error: "No bots allowed" }));
        return res.status(403).json({message: "Bot access denied."})
      } else {
        // res.writeHead(403, { "Content-Type": "application/json" });
        // res.end(JSON.stringify({ error: "Forbidden" }));
        return res.status(403).json({message: "Access denied by security policy."})
      }
    }
     else if (decision.ip.isHosting()) {
      // Requests from hosting IPs are likely from bots, so they can usually be
      // blocked. However, consider your use case - if this is an API endpoint
      // then hosting IPs might be legitimate.
      // https://docs.arcjet.com/blueprints/vpn-proxy-detection
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
    } else if (decision.results.some(isSpoofedBot)) {
      // Paid Arcjet accounts include additional verification checks using IP data.
      // Verification isn't always possible, so we recommend checking the decision
      // separately.
      // https://docs.arcjet.com/bot-protection/reference#bot-verification
      // res.writeHead(403, { "Content-Type": "application/json" });
      // res.end(JSON.stringify({ error: "Forbidden" }));
      return res.status(403).json({
        error: "Spoof bot detected.",
        message: "Malicious bot activity detected"
      })
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Hello World" }));
    }

    next()
  } catch (error) {
    console.log("Arcjet protection error",error)
    next();
  }
  console.log("Arcjet decision", decision);

}