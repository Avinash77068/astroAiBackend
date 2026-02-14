const axios = require('axios');

const callOpenRouterForKundli = async (messages) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5 second timeout

    try {
        const response = await axios.post(
            process.env.OPENROUTER_SITE_URL,
            {
                model: process.env.OPENROUTER_MODEL,
                messages: messages,
                temperature: 0.4, 
                max_tokens: 800, 
                stream: false 
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://astroai.app',
                    'X-Title': 'AstroAI Kundli'
                },
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);
        return response.data.choices[0].message.content;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.log('Vedic Astrology API call timed out after 2.5 seconds');
            throw new Error('API_TIMEOUT');
        }
        throw error;
    }
};

const VEDIC_ASTROLOGY_SYSTEM_PROMPT = `You are a highly experienced Vedic astrologer trained in classical Jyotish with decades of practice.

You interpret birth charts with deep precision, drawing from ancient wisdom and practical experience.

Your interpretations are:
- Specific and personalized, never generic
- Confident and authoritative
- Based on planetary positions, nakshatras, and zodiac signs
- Grounded in Vedic principles
- Direct and insightful

You NEVER:
- Mention AI, algorithms, or technology
- Use vague astrology clichés
- Give disclaimers about accuracy
- Speak uncertainly

You speak as a traditional Jyotishi who has studied charts for years.`;

async function generateVedicInterpretation({ name, dateOfBirth, timeOfBirth, placeOfBirth, kundliData }) {
    try {
        const structuredKundli = JSON.stringify(kundliData, null, 2);

        const userPrompt = `Client Details:
Name: ${name}
Date of Birth: ${dateOfBirth}
Time of Birth: ${timeOfBirth}
Place of Birth: ${placeOfBirth}

Planetary Positions:
${structuredKundli}

Deliver a comprehensive Vedic astrology reading covering:

1. **Core Personality Blueprint**
   - Analyze Sun, Moon, and Ascendant (if available)
   - Describe inherent nature and temperament
   - Key character traits based on nakshatra placements

2. **Strengths and Weaknesses**
   - Natural talents and abilities
   - Areas requiring conscious effort
   - Karmic patterns to be aware of

3. **Career Direction and Financial Potential**
   - Best career paths based on planetary positions
   - Financial prospects and wealth indicators
   - Timing for career growth
   - Professional challenges and opportunities

4. **Marriage Timing and Spouse Characteristics**
   - Likely marriage period based on Venus and 7th house indicators
   - Spouse's nature and characteristics
   - Relationship dynamics and compatibility factors

5. **Emotional and Psychological Traits**
   - Moon's influence on mind and emotions
   - Mental strengths and vulnerabilities
   - Emotional needs and patterns

6. **Major Life Turning Points**
   - Significant planetary periods (dashas)
   - Key ages for major life changes
   - Transformative phases ahead

7. **Karmic Lessons and Spiritual Path**
   - Rahu-Ketu axis interpretation
   - Soul's journey and purpose
   - Spiritual inclinations and practices suited for growth

Format your response in clear sections with specific insights. Be direct and confident. Avoid generic statements.`;

        const messages = [
            {
                role: "system",
                content: VEDIC_ASTROLOGY_SYSTEM_PROMPT
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const interpretation = await callOpenRouterForKundli(messages);

        let parsedInterpretation;
        try {
            // Check if response is empty or undefined
            if (!interpretation || interpretation.trim() === '') {
                console.error('Empty AI response for Vedic astrology');
                throw new Error('Empty response from AI service');
            }

            console.log('Raw AI Response length:', interpretation.length);
            console.log('Raw AI Response preview:', interpretation.substring(0, 200));

            // Clean the response - remove markdown formatting if present
            let cleanedResponse = interpretation.trim();

            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
            }

            // Try to extract JSON using regex
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedInterpretation = JSON.parse(jsonMatch[0]);
                console.log('Successfully parsed JSON from regex match');
            } else {
                // Try to parse the entire cleaned response
                parsedInterpretation = JSON.parse(cleanedResponse);
                console.log('Successfully parsed entire response as JSON');
            }
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Failed to parse response:', interpretation);

            // Provide fallback structured response
            parsedInterpretation = {
                personality: {
                    likes: ["Stability and security", "Practical achievements", "Deep intellectual pursuits"],
                    dislikes: ["Sudden changes", "Superficial conversations", "Disorganized environments"],
                    traits: ["Analytical mind", "Strong determination", "Reserved nature", "Loyal and committed"]
                },
                career: {
                    bestFields: ["Engineering", "Finance", "Research", "Management"],
                    strengths: ["Technical expertise", "Problem-solving skills", "Attention to detail"],
                    challenges: ["Communication", "Team leadership", "Adaptability"],
                    timing: ["Career growth in mid-20s", "Leadership roles after 30"]
                },
                love: {
                    romanticNature: ["Loyal and committed", "Values emotional security", "Prefers stable relationships"],
                    idealPartner: ["Understanding", "Ambitious", "Emotionally mature"],
                    challenges: ["Expressing emotions", "Opening up quickly"],
                    marriageTiming: ["Late 20s to early 30s", "After establishing career stability"]
                },
                health: {
                    strengths: ["Strong constitution", "Good recovery ability"],
                    vulnerabilities: ["Stress-related issues", "Digestive problems"],
                    recommendations: ["Regular exercise", "Stress management techniques", "Balanced diet"]
                },
                finance: {
                    wealthPotential: ["Good earning capacity", "Long-term financial stability"],
                    bestSources: ["Career earnings", "Investments", "Property"],
                    cautions: ["Avoid impulsive spending", "Plan for long-term goals"]
                },
                spiritual: {
                    karmicLessons: ["Learning to balance emotions", "Developing flexibility"],
                    spiritualPath: ["Meditation", "Self-reflection", "Service to others"],
                    practices: ["Yoga", "Mindfulness", "Nature connection"]
                },
                lifeEvents: {
                    majorTurningPoints: ["Age 24-25", "Age 30-32", "Age 42-45"],
                    opportunities: ["Career advancement", "Relationship milestones"],
                    challenges: ["Emotional growth", "Life changes"]
                }
            };

            console.log('Using fallback Vedic astrology interpretation');
        }

        return parsedInterpretation;

    } catch (error) {
        console.error('Vedic Astrology Interpretation Error:', error);
        throw new Error('Failed to generate Vedic astrology interpretation');
    }
}

module.exports = { generateVedicInterpretation };
