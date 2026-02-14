const { callOpenRouter } = require('../middleware/AiChatResponse/api/openRouterService');
const SYSTEM_PROMPTS = require('../middleware/AiChatResponse/api/prompts');

const callOpenRouterForAnalysis = async (messages) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5 second timeout

    try {
        const response = await fetch(
            process.env.OPENROUTER_SITE_URL,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://astroai.app',
                    'X-Title': 'AstroAI Analysis'
                },
                body: JSON.stringify({
                    model: process.env.OPENROUTER_MODEL,
                    messages: messages,
                    temperature: 0.4, // Reduced for faster, more consistent responses
                    max_tokens: 600, // Reduced from 2000 for faster completion
                    stream: false // Disable streaming for faster response
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.log('AI API call timed out after 2.5 seconds');
            throw new Error('API_TIMEOUT');
        }
        throw error;
    }
};

// Career Analysis Service
async function analyzeCareerAI({ currentJob, experience, skills, goals }) {
    try {
        const userPrompt = `Analyze career prospects based on this profile and return ONLY a JSON object.

Current Job: ${currentJob || 'Not specified'}
Experience: ${experience || 'Not specified'}
Skills: ${skills || 'Not specified'}
Career Goals: ${goals || 'Not specified'}

Return ONLY this JSON structure with specific insights:

{
  "career": {
    "currentAssessment": ["assessment 1", "assessment 2", "assessment 3"],
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "growthAreas": ["area 1", "area 2", "area 3"],
    "recommendedFields": ["field 1", "field 2", "field 3", "field 4"],
    "salaryPotential": ["insight 1", "insight 2"],
    "nextSteps": ["step 1", "step 2", "step 3"],
    "timeline": ["milestone 1", "milestone 2", "milestone 3"]
  }
}`;

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS.career_analysis
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const response = await callOpenRouterForAnalysis(messages);

        try {
            // Check if response is empty or undefined
            if (!response || response.trim() === '') {
                console.error('Empty AI response for analysis');
                throw new Error('Empty response from AI service');
            }

            console.log('Raw AI Response length:', response.length);
            console.log('Raw AI Response preview:', response.substring(0, 200));

            // Clean the response - remove markdown formatting if present
            let cleanedResponse = response.trim();

            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
            }

            // Try to extract JSON using regex
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                // Try to parse the entire cleaned response
                return JSON.parse(cleanedResponse);
            }
        } catch (parseError) {
            console.error('Career Analysis Parse Error:', parseError);
            console.error('Failed to parse response:', response);

            // Provide fallback career analysis response
            return {
                career: {
                    currentAssessment: ["Your current role provides good technical foundation", "Experience level is solid for career progression", "Skills are in demand in current market"],
                    strengths: ["Technical expertise", "Problem-solving abilities", "Dedication to work"],
                    growthAreas: ["Leadership skills", "Communication", "Business acumen"],
                    recommendedFields: ["Software Development", "Project Management", "Technical Leadership"],
                    salaryPotential: ["Mid-level range currently", "Senior level potential within 2-3 years"],
                    nextSteps: ["Pursue leadership training", "Network with industry professionals", "Consider certifications"],
                    timeline: ["Skill development in next 6 months", "Career advancement within 1-2 years"]
                }
            };
        }

    } catch (error) {
        console.error('Career Analysis Error:', error);
        if (error.message === 'API_TIMEOUT') {
            console.log('Using fast fallback for career analysis due to timeout');
        }
        throw new Error('Failed to generate career analysis');
    }
}

// Education Analysis Service
async function analyzeEducationAI({ educationLevel, fieldOfInterest, learningGoals, currentSkills }) {
    try {
        const userPrompt = `Analyze education and learning path based on this profile and return ONLY a JSON object.

Education Level: ${educationLevel || 'Not specified'}
Field of Interest: ${fieldOfInterest || 'Not specified'}
Learning Goals: ${learningGoals || 'Not specified'}
Current Skills: ${currentSkills || 'Not specified'}

Return ONLY this JSON structure with specific insights:

{
  "education": {
    "currentAssessment": ["assessment 1", "assessment 2", "assessment 3"],
    "skillGaps": ["gap 1", "gap 2", "gap 3"],
    "recommendedPath": ["path 1", "path 2", "path 3"],
    "bestFields": ["field 1", "field 2", "field 3"],
    "learningResources": ["resource 1", "resource 2", "resource 3"],
    "timeline": ["milestone 1", "milestone 2", "milestone 3"],
    "careerAlignment": ["alignment 1", "alignment 2"]
  }
}`;

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS.education_analysis
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const response = await callOpenRouterForAnalysis(messages);

        try {
            // Check if response is empty or undefined
            if (!response || response.trim() === '') {
                console.error('Empty AI response for education analysis');
                throw new Error('Empty response from AI service');
            }

            console.log('Raw AI Response length:', response.length);
            console.log('Raw AI Response preview:', response.substring(0, 200));

            // Clean the response - remove markdown formatting if present
            let cleanedResponse = response.trim();

            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
            }

            // Try to extract JSON using regex
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                // Try to parse the entire cleaned response
                return JSON.parse(cleanedResponse);
            }
        } catch (parseError) {
            console.error('Education Analysis Parse Error:', parseError);
            console.error('Failed to parse response:', response);

            // Provide fallback education analysis response
            return {
                education: {
                    currentAssessment: ["Your educational background provides a solid foundation", "Additional skills development would be beneficial", "Clear learning goals show good direction"],
                    skillGaps: ["Advanced technical skills", "Soft skills development", "Industry-specific knowledge"],
                    recommendedPath: ["Pursue specialized certifications", "Consider advanced degree programs", "Focus on practical skill development"],
                    bestFields: ["Technology sector", "Research and development", "Management roles"],
                    learningResources: ["Online learning platforms", "Professional workshops", "Industry conferences"],
                    timeline: ["Short-term skill acquisition: 3-6 months", "Mid-term career advancement: 1-2 years"],
                    careerAlignment: ["Align learning with career goals", "Focus on high-demand skills", "Build professional network"]
                }
            };
        }

    } catch (error) {
        console.error('Education Analysis Error:', error);
        throw new Error('Failed to generate education analysis');
    }
}

// Finance Analysis Service
async function analyzeFinanceAI({ monthlyIncome, monthlyExpenses, financialGoals, currentSavings }) {
    try {
        const userPrompt = `Analyze financial situation and provide advice. Return ONLY a JSON object.

Monthly Income: ${monthlyIncome || 'Not specified'}
Monthly Expenses: ${monthlyExpenses || 'Not specified'}
Financial Goals: ${financialGoals || 'Not specified'}
Current Savings: ${currentSavings || 'Not specified'}

Return ONLY this JSON structure with specific insights:

{
  "finance": {
    "currentSituation": ["assessment 1", "assessment 2", "assessment 3"],
    "budgetAnalysis": ["analysis 1", "analysis 2", "analysis 3"],
    "savingStrategies": ["strategy 1", "strategy 2", "strategy 3"],
    "investmentOptions": ["option 1", "option 2", "option 3"],
    "riskAssessment": ["risk 1", "risk 2"],
    "goalTimeline": ["timeline 1", "timeline 2", "timeline 3"],
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
  }
}`;

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS.finance_analysis
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const response = await callOpenRouterForAnalysis(messages);

        try {
            // Check if response is empty or undefined
            if (!response || response.trim() === '') {
                console.error('Empty AI response for finance analysis');
                throw new Error('Empty response from AI service');
            }

            console.log('Raw AI Response length:', response.length);
            console.log('Raw AI Response preview:', response.substring(0, 200));

            // Clean the response - remove markdown formatting if present
            let cleanedResponse = response.trim();

            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
            }

            // Try to extract JSON using regex
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                // Try to parse the entire cleaned response
                return JSON.parse(cleanedResponse);
            }
        } catch (parseError) {
            console.error('Finance Analysis Parse Error:', parseError);
            console.error('Failed to parse response:', response);

            // Provide fallback finance analysis response
            return {
                finance: {
                    currentSituation: ["Income and expenses need better balance", "Savings rate could be improved", "Financial goals are clear but need structured plan"],
                    budgetAnalysis: ["Track all expenses carefully", "Identify areas for cost reduction", "Create emergency fund buffer"],
                    savingStrategies: ["Automate savings transfers", "Cut discretionary spending", "Increase income through side work"],
                    investmentOptions: ["Start with index funds", "Consider retirement accounts", "Build diversified portfolio"],
                    riskAssessment: ["Current approach is conservative", "Consider moderate risk for growth", "Insurance coverage needs review"],
                    goalTimeline: ["Emergency fund: 3-6 months", "Major goals: 2-5 years", "Long-term wealth: 10+ years"],
                    recommendations: ["Create detailed budget", "Build emergency savings", "Start investing early", "Seek professional advice"]
                }
            };
        }

    } catch (error) {
        console.error('Finance Analysis Error:', error);
        throw new Error('Failed to generate finance analysis');
    }
}

// Health Analysis Service
async function analyzeHealthAI({ name, dateOfBirth, healthConcerns, lifestyle }) {
    try {
        const userPrompt = `Analyze health profile and provide wellness advice. Return ONLY a JSON object.

Name: ${name || 'Not specified'}
Date of Birth: ${dateOfBirth || 'Not specified'}
Health Concerns: ${healthConcerns || 'Not specified'}
Lifestyle: ${lifestyle || 'Not specified'}

Return ONLY this JSON structure with specific insights:

{
  "health": {
    "currentAssessment": ["assessment 1", "assessment 2", "assessment 3"],
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "vulnerabilities": ["vulnerability 1", "vulnerability 2", "vulnerability 3"],
    "lifestyleRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
    "preventiveMeasures": ["measure 1", "measure 2", "measure 3"],
    "dietaryAdvice": ["advice 1", "advice 2", "advice 3"],
    "exercisePlan": ["exercise 1", "exercise 2", "exercise 3"]
  }
}`;

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS.health_analysis
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const response = await callOpenRouterForAnalysis(messages);

        try {
            // Check if response is empty or undefined
            if (!response || response.trim() === '') {
                console.error('Empty AI response for health analysis');
                throw new Error('Empty response from AI service');
            }

            console.log('Raw AI Response length:', response.length);
            console.log('Raw AI Response preview:', response.substring(0, 200));

            // Clean the response - remove markdown formatting if present
            let cleanedResponse = response.trim();

            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
            }

            // Try to extract JSON using regex
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                // Try to parse the entire cleaned response
                return JSON.parse(cleanedResponse);
            }
        } catch (parseError) {
            console.error('Health Analysis Parse Error:', parseError);
            console.error('Failed to parse response:', response);

            // Provide fallback health analysis response
            return {
                health: {
                    currentAssessment: ["Overall health appears stable", "Focus on preventive care is recommended", "Lifestyle factors are important for well-being"],
                    strengths: ["Good basic health foundation", "Awareness of health needs", "Motivation for improvement"],
                    vulnerabilities: ["Potential stress-related issues", "Need for regular check-ups", "Lifestyle-related concerns"],
                    lifestyleRecommendations: ["Maintain balanced diet", "Regular exercise routine", "Adequate sleep schedule"],
                    preventiveMeasures: ["Annual health screenings", "Vaccinations up to date", "Monitor chronic conditions"],
                    dietaryAdvice: ["Increase vegetable intake", "Reduce processed foods", "Stay hydrated regularly"],
                    exercisePlan: ["30 minutes daily activity", "Mix of cardio and strength training", "Include flexibility exercises"]
                }
            };
        }

    } catch (error) {
        console.error('Health Analysis Error:', error);
        throw new Error('Failed to generate health analysis');
    }
}

// Love Analysis Service
async function analyzeLoveAI({ userName, partnerName, relationshipStatus, concerns }) {
    try {
        const userPrompt = `Analyze romantic relationship and provide insights. Return ONLY a JSON object.

User Name: ${userName || 'Not specified'}
Partner Name: ${partnerName || 'Not specified'}
Relationship Status: ${relationshipStatus || 'Not specified'}
Concerns: ${concerns || 'Not specified'}

Return ONLY this JSON structure with specific insights:

{
  "love": {
    "relationshipDynamics": ["dynamic 1", "dynamic 2", "dynamic 3"],
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "challenges": ["challenge 1", "challenge 2", "challenge 3"],
    "communicationTips": ["tip 1", "tip 2", "tip 3"],
    "compatibilityInsights": ["insight 1", "insight 2", "insight 3"],
    "futureOutlook": ["outlook 1", "outlook 2", "outlook 3"],
    "growthAreas": ["area 1", "area 2", "area 3"]
  }
}`;

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS.love_analysis
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const response = await callOpenRouterForAnalysis(messages);

        try {
            // Check if response is empty or undefined
            if (!response || response.trim() === '') {
                console.error('Empty AI response for love analysis');
                throw new Error('Empty response from AI service');
            }

            console.log('Raw AI Response length:', response.length);
            console.log('Raw AI Response preview:', response.substring(0, 200));

            // Clean the response - remove markdown formatting if present
            let cleanedResponse = response.trim();

            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
            }

            // Try to extract JSON using regex
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                // Try to parse the entire cleaned response
                return JSON.parse(cleanedResponse);
            }
        } catch (parseError) {
            console.error('Love Analysis Parse Error:', parseError);
            console.error('Failed to parse response:', response);

            // Provide fallback love analysis response
            return {
                love: {
                    relationshipDynamics: ["Communication is key to success", "Mutual respect and understanding", "Emotional connection needs nurturing"],
                    strengths: ["Strong emotional bond", "Shared values and goals", "Good communication foundation"],
                    challenges: ["Communication gaps need addressing", "Different emotional needs", "External stress factors"],
                    communicationTips: ["Practice active listening", "Express feelings openly", "Regular check-ins about relationship"],
                    compatibilityInsights: ["Emotional compatibility is strong", "Shared life goals alignment", "Complementary personality traits"],
                    futureOutlook: ["Positive long-term potential", "Growth opportunities together", "Building stronger foundation"],
                    growthAreas: ["Deepen emotional intimacy", "Improve conflict resolution", "Strengthen trust and security"]
                }
            };
        }

    } catch (error) {
        console.error('Love Analysis Error:', error);
        throw new Error('Failed to generate love analysis');
    }
}

// Matching Analysis Service
async function analyzeMatchingAI({ userName, userDOB, partnerName, partnerDOB, relationshipType }) {
    try {
        const userPrompt = `Analyze compatibility between two people. Return ONLY a JSON object.

User 1: ${userName || 'Not specified'} (${userDOB || 'Not specified'})
User 2: ${partnerName || 'Not specified'} (${partnerDOB || 'Not specified'})
Relationship Type: ${relationshipType || 'Romantic'}

Return ONLY this JSON structure with specific insights:

{
  "matching": {
    "compatibilityScore": ["score 1", "score 2", "score 3"],
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "challenges": ["challenge 1", "challenge 2", "challenge 3"],
    "communicationStyle": ["style 1", "style 2"],
    "emotionalCompatibility": ["compatibility 1", "compatibility 2", "compatibility 3"],
    "longTermPotential": ["potential 1", "potential 2", "potential 3"],
    "advice": ["advice 1", "advice 2", "advice 3"]
  }
}`;

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS.matching_analysis
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const response = await callOpenRouterForAnalysis(messages);

        try {
            // Check if response is empty or undefined
            if (!response || response.trim() === '') {
                console.error('Empty AI response for matching analysis');
                throw new Error('Empty response from AI service');
            }

            console.log('Raw AI Response length:', response.length);
            console.log('Raw AI Response preview:', response.substring(0, 200));

            // Clean the response - remove markdown formatting if present
            let cleanedResponse = response.trim();

            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
            }

            // Try to extract JSON using regex
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                // Try to parse the entire cleaned response
                return JSON.parse(cleanedResponse);
            }
        } catch (parseError) {
            console.error('Matching Analysis Parse Error:', parseError);
            console.error('Failed to parse response:', response);

            // Provide fallback matching analysis response
            return {
                matching: {
                    compatibilityScore: ["High emotional compatibility", "Good communication alignment", "Shared life goals and values"],
                    strengths: ["Strong emotional connection", "Mutual respect and understanding", "Complementary strengths"],
                    challenges: ["Different communication styles", "Need to align on future goals", "External family influences"],
                    communicationStyle: ["Open and direct communication", "Emotional expression needs work"],
                    emotionalCompatibility: ["Deep emotional understanding", "Mutual support during challenges", "Shared emotional needs"],
                    longTermPotential: ["Strong foundation for long-term commitment", "Growth opportunities together", "Building lasting partnership"],
                    advice: ["Continue open communication", "Address differences constructively", "Build shared experiences and goals"]
                }
            };
        }

    } catch (error) {
        console.error('Matching Analysis Error:', error);
        throw new Error('Failed to generate matching analysis');
    }
}

// Mental Health Analysis Service
async function analyzeMentalHealthAI({ currentMood, stressLevel, feelings, concerns }) {
    try {
        const userPrompt = `Analyze mental health and provide supportive insights. Return ONLY a JSON object.

Current Mood: ${currentMood || 'Not specified'}
Stress Level: ${stressLevel || 'Not specified'}
Feelings: ${feelings || 'Not specified'}
Concerns: ${concerns || 'Not specified'}

Return ONLY this JSON structure with specific insights:

{
  "mentalHealth": {
    "currentAssessment": ["assessment 1", "assessment 2", "assessment 3"],
    "emotionalPatterns": ["pattern 1", "pattern 2", "pattern 3"],
    "stressors": ["stressor 1", "stressor 2", "stressor 3"],
    "copingStrategies": ["strategy 1", "strategy 2", "strategy 3"],
    "wellnessTips": ["tip 1", "tip 2", "tip 3"],
    "whenToSeekHelp": ["sign 1", "sign 2", "sign 3"],
    "positiveOutlook": ["outlook 1", "outlook 2", "outlook 3"]
  }
}`;

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS.mental_health_analysis
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

        const response = await callOpenRouterForAnalysis(messages);

        try {
            // Check if response is empty or undefined
            if (!response || response.trim() === '') {
                console.error('Empty AI response for mental health analysis');
                throw new Error('Empty response from AI service');
            }

            console.log('Raw AI Response length:', response.length);
            console.log('Raw AI Response preview:', response.substring(0, 200));

            // Clean the response - remove markdown formatting if present
            let cleanedResponse = response.trim();

            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
            }

            // Try to extract JSON using regex
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                // Try to parse the entire cleaned response
                return JSON.parse(cleanedResponse);
            }
        } catch (parseError) {
            console.error('Mental Health Analysis Parse Error:', parseError);
            console.error('Failed to parse response:', response);

            // Provide fallback mental health analysis response
            return {
                mentalHealth: {
                    currentAssessment: ["Current mood and stress levels indicate need for attention", "Emotional well-being can be improved with support", "Professional guidance may be beneficial"],
                    emotionalPatterns: ["Stress management techniques needed", "Emotional expression could be enhanced", "Coping mechanisms need development"],
                    stressors: ["Work-related pressure", "Personal relationship concerns", "Life changes and transitions"],
                    copingStrategies: ["Practice mindfulness and meditation", "Maintain social connections", "Establish healthy daily routines"],
                    wellnessTips: ["Regular exercise and physical activity", "Adequate sleep and rest", "Healthy eating and nutrition"],
                    whenToSeekHelp: ["Persistent feelings of sadness or anxiety", "Difficulty coping with daily activities", "Thoughts of self-harm or suicide"],
                    positiveOutlook: ["Small daily improvements lead to big changes", "Professional support is available and effective", "Recovery and growth are possible"]
                }
            };
        }

    } catch (error) {
        console.error('Mental Health Analysis Error:', error);
        throw new Error('Failed to generate mental health analysis');
    }
}

module.exports = {
    analyzeCareerAI,
    analyzeEducationAI,
    analyzeFinanceAI,
    analyzeHealthAI,
    analyzeLoveAI,
    analyzeMatchingAI,
    analyzeMentalHealthAI
};
