export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { response, objective } = await request.json();

    const result = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `You are an educational feedback system.

Learning Objective: ${objective}

Learner Response: ${response}

Give structured feedback with:
**Strengths:** what they got right
**Areas for Growth:** what's missing or incorrect  
**Next Steps:** 2-3 concrete suggestions

Reference the learning objective explicitly.`
        }],
      }),
    });

    const data = await result.json();
    const feedback = data.content[0].text;

    return new Response(JSON.stringify({ feedback }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};