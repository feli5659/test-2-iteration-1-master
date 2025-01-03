const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    const keyword = event.queryStringParameters.keyword;

    if (!keyword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No keyword provided" }),
      };
    }

    const [mainCompletion, cardCompletion, headingCompletion] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Du er en professionel marketingekspert der skriver på dansk om Refyne's services. Du skriver engagerende og overbevisende tekster der fokuserer på data-drevet tilgang og målbare resultater.",
          },
          {
            role: "user",
            content: `Skriv en engagerende paragraf om hvordan Refyne hjælper virksomheder med ${keyword}. 
            Teksten skal være professionel og fokusere på Refyne's datadrevne tilgang og evne til at skabe målbare resultater. 
            Hold teksten omkring 2-3 sætninger.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),

      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Du er en professionel marketingekspert der skriver på dansk om Refyne's services. Du skriver engagerende og overbevisende tekster der fokuserer på data-drevet tilgang og målbare resultater.",
          },
          {
            role: "user",
            content: `Generer 3 kort med indhold om hvordan Refyne hjælper med ${keyword}. 
            For hvert kort, giv:
            1. En kort overskrift (max 4 ord)
            2. En beskrivende tekst på 2-3 sætninger der fremhæver en specifik fordel eller proces
            
            Formater outputtet som JSON med strukturen:
            {
              "cards": [
                {
                  "title": "...",
                  "description": "..."
                }
              ]
            }`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),

      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Du er en professionel marketingekspert der skriver på dansk om Refyne's services. Du skriver engagerende og overbevisende tekster der fokuserer på data-drevet tilgang og målbare resultater.",
          },
          {
            role: "user",
            content: `Skriv en kort, fængende overskrift der spørger om virksomheder er klar til at træffe beslutninger baseret på data inden for ${keyword}. 
            Overskriften skal være kort og præcis, max 10 ord.
            Den skal være formuleret som et spørgsmål og relatere til ${keyword} og data-drevet beslutningstagning.`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    ]);

    const mainContent = mainCompletion.choices[0].message.content;
    const cardContent = JSON.parse(cardCompletion.choices[0].message.content);
    const cardHeading = headingCompletion.choices[0].message.content;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: mainContent,
        cards: cardContent.cards,
        cardHeading: cardHeading,
        keyword: keyword,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
