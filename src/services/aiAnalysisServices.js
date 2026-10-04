const SYSTEM_PROMPTS = require('../middleware/AiChatResponse/api/prompts');

const callOpenRouterForAnalysis = async (messages) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(process.env.OPENROUTER_SITE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://astroai.app',
                'X-Title': 'AstroAI Analysis'
            },
            body: JSON.stringify({
                model: process.env.OPENROUTER_MODEL,
                messages,
                temperature: 0.3,
                max_tokens: 450,
                stream: false
            }),
            signal: controller.signal
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        if (error.name === 'AbortError') throw new Error('API_TIMEOUT');
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

const parseJsonResponse = (text) => {
    const cleaned = text.replace(/```(?:json)?\n?/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : cleaned);
};

// shape: "key:count,key:count" -> compact schema hint for the model
const buildPrompt = (root, shape, fields) => {
    const data = Object.entries(fields).map(([label, value]) => `${label}: ${value || 'N/A'}`).join('\n');
    return `${data}\nReturn JSON only: {"${root}":{${shape.split(',').map((s) => {
        const [key, count] = s.split(':');
        return `"${key}":[${count} items, max 12 words each]`;
    }).join(',')}}}`;
};

const runAnalysis = async ({ label, systemPrompt, userPrompt, fallback }) => {
    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];
        const response = await callOpenRouterForAnalysis(messages);

        try {
            if (!response || !response.trim()) throw new Error('Empty response from AI service');
            return parseJsonResponse(response);
        } catch (parseError) {
            console.error(`${label} Analysis Parse Error:`, parseError.message);
            return fallback;
        }
    } catch (error) {
        if (error.message === 'API_TIMEOUT') return fallback;
        console.error(`${label} Analysis Error:`, error.message);
        throw new Error(`Failed to generate ${label.toLowerCase()} analysis`);
    }
};

const analyzeCareerAI = ({ currentJob, experience, skills, goals }) => runAnalysis({
    label: 'Career',
    systemPrompt: SYSTEM_PROMPTS.career_analysis,
    userPrompt: buildPrompt('career', 'currentAssessment:3,strengths:3,growthAreas:3,recommendedFields:4,salaryPotential:2,nextSteps:3,timeline:3', {
        'Job': currentJob, 'Experience': experience, 'Skills': skills, 'Goals': goals
    }),
    fallback: {
        career: {
            currentAssessment: ["Your current role provides good technical foundation", "Experience level is solid for career progression", "Skills are in demand in current market"],
            strengths: ["Technical expertise", "Problem-solving abilities", "Dedication to work"],
            growthAreas: ["Leadership skills", "Communication", "Business acumen"],
            recommendedFields: ["Software Development", "Project Management", "Technical Leadership"],
            salaryPotential: ["Mid-level range currently", "Senior level potential within 2-3 years"],
            nextSteps: ["Pursue leadership training", "Network with industry professionals", "Consider certifications"],
            timeline: ["Skill development in next 6 months", "Career advancement within 1-2 years"]
        }
    }
});

const analyzeEducationAI = ({ educationLevel, fieldOfInterest, learningGoals, currentSkills }) => runAnalysis({
    label: 'Education',
    systemPrompt: SYSTEM_PROMPTS.education_analysis,
    userPrompt: buildPrompt('education', 'currentAssessment:3,skillGaps:3,recommendedPath:3,bestFields:3,learningResources:3,timeline:3,careerAlignment:2', {
        'Education': educationLevel, 'Interest': fieldOfInterest, 'Goals': learningGoals, 'Skills': currentSkills
    }),
    fallback: {
        education: {
            currentAssessment: ["Your educational background provides a solid foundation", "Additional skills development would be beneficial", "Clear learning goals show good direction"],
            skillGaps: ["Advanced technical skills", "Soft skills development", "Industry-specific knowledge"],
            recommendedPath: ["Pursue specialized certifications", "Consider advanced degree programs", "Focus on practical skill development"],
            bestFields: ["Technology sector", "Research and development", "Management roles"],
            learningResources: ["Online learning platforms", "Professional workshops", "Industry conferences"],
            timeline: ["Short-term skill acquisition: 3-6 months", "Mid-term career advancement: 1-2 years"],
            careerAlignment: ["Align learning with career goals", "Focus on high-demand skills", "Build professional network"]
        }
    }
});

const analyzeFinanceAI = ({ monthlyIncome, monthlyExpenses, financialGoals, currentSavings }) => runAnalysis({
    label: 'Finance',
    systemPrompt: SYSTEM_PROMPTS.finance_analysis,
    userPrompt: buildPrompt('finance', 'currentSituation:3,budgetAnalysis:3,savingStrategies:3,investmentOptions:3,riskAssessment:2,goalTimeline:3,recommendations:3', {
        'Income': monthlyIncome, 'Expenses': monthlyExpenses, 'Goals': financialGoals, 'Savings': currentSavings
    }),
    fallback: {
        finance: {
            currentSituation: ["Income and expenses need better balance", "Savings rate could be improved", "Financial goals are clear but need structured plan"],
            budgetAnalysis: ["Track all expenses carefully", "Identify areas for cost reduction", "Create emergency fund buffer"],
            savingStrategies: ["Automate savings transfers", "Cut discretionary spending", "Increase income through side work"],
            investmentOptions: ["Start with index funds", "Consider retirement accounts", "Build diversified portfolio"],
            riskAssessment: ["Current approach is conservative", "Consider moderate risk for growth", "Insurance coverage needs review"],
            goalTimeline: ["Emergency fund: 3-6 months", "Major goals: 2-5 years", "Long-term wealth: 10+ years"],
            recommendations: ["Create detailed budget", "Build emergency savings", "Start investing early", "Seek professional advice"]
        }
    }
});

const analyzeHealthAI = ({ name, dateOfBirth, healthConcerns, lifestyle }) => runAnalysis({
    label: 'Health',
    systemPrompt: SYSTEM_PROMPTS.health_analysis,
    userPrompt: buildPrompt('health', 'currentAssessment:3,strengths:3,vulnerabilities:3,lifestyleRecommendations:3,preventiveMeasures:3,dietaryAdvice:3,exercisePlan:3', {
        'Name': name, 'DOB': dateOfBirth, 'Concerns': healthConcerns, 'Lifestyle': lifestyle
    }),
    fallback: {
        health: {
            currentAssessment: ["Overall health appears stable", "Focus on preventive care is recommended", "Lifestyle factors are important for well-being"],
            strengths: ["Good basic health foundation", "Awareness of health needs", "Motivation for improvement"],
            vulnerabilities: ["Potential stress-related issues", "Need for regular check-ups", "Lifestyle-related concerns"],
            lifestyleRecommendations: ["Maintain balanced diet", "Regular exercise routine", "Adequate sleep schedule"],
            preventiveMeasures: ["Annual health screenings", "Vaccinations up to date", "Monitor chronic conditions"],
            dietaryAdvice: ["Increase vegetable intake", "Reduce processed foods", "Stay hydrated regularly"],
            exercisePlan: ["30 minutes daily activity", "Mix of cardio and strength training", "Include flexibility exercises"]
        }
    }
});

const analyzeLoveAI = ({ userName, partnerName, relationshipStatus, concerns }) => runAnalysis({
    label: 'Love',
    systemPrompt: SYSTEM_PROMPTS.love_analysis,
    userPrompt: buildPrompt('love', 'relationshipDynamics:3,strengths:3,challenges:3,communicationTips:3,compatibilityInsights:3,futureOutlook:3,growthAreas:3', {
        'User': userName, 'Partner': partnerName, 'Status': relationshipStatus, 'Concerns': concerns
    }),
    fallback: {
        love: {
            relationshipDynamics: ["Communication is key to success", "Mutual respect and understanding", "Emotional connection needs nurturing"],
            strengths: ["Strong emotional bond", "Shared values and goals", "Good communication foundation"],
            challenges: ["Communication gaps need addressing", "Different emotional needs", "External stress factors"],
            communicationTips: ["Practice active listening", "Express feelings openly", "Regular check-ins about relationship"],
            compatibilityInsights: ["Emotional compatibility is strong", "Shared life goals alignment", "Complementary personality traits"],
            futureOutlook: ["Positive long-term potential", "Growth opportunities together", "Building stronger foundation"],
            growthAreas: ["Deepen emotional intimacy", "Improve conflict resolution", "Strengthen trust and security"]
        }
    }
});

const analyzeMatchingAI = ({ userName, userDOB, partnerName, partnerDOB, relationshipType }) => runAnalysis({
    label: 'Matching',
    systemPrompt: SYSTEM_PROMPTS.matching_analysis,
    userPrompt: buildPrompt('matching', 'compatibilityScore:3,strengths:3,challenges:3,communicationStyle:2,emotionalCompatibility:3,longTermPotential:3,advice:3', {
        'Person1': `${userName || 'N/A'} (${userDOB || 'N/A'})`,
        'Person2': `${partnerName || 'N/A'} (${partnerDOB || 'N/A'})`,
        'Type': relationshipType || 'Romantic'
    }),
    fallback: {
        matching: {
            compatibilityScore: ["High emotional compatibility", "Good communication alignment", "Shared life goals and values"],
            strengths: ["Strong emotional connection", "Mutual respect and understanding", "Complementary strengths"],
            challenges: ["Different communication styles", "Need to align on future goals", "External family influences"],
            communicationStyle: ["Open and direct communication", "Emotional expression needs work"],
            emotionalCompatibility: ["Deep emotional understanding", "Mutual support during challenges", "Shared emotional needs"],
            longTermPotential: ["Strong foundation for long-term commitment", "Growth opportunities together", "Building lasting partnership"],
            advice: ["Continue open communication", "Address differences constructively", "Build shared experiences and goals"]
        }
    }
});

const analyzeMentalHealthAI = ({ currentMood, stressLevel, feelings, concerns }) => runAnalysis({
    label: 'Mental Health',
    systemPrompt: SYSTEM_PROMPTS.mental_health_analysis,
    userPrompt: buildPrompt('mentalHealth', 'currentAssessment:3,emotionalPatterns:3,stressors:3,copingStrategies:3,wellnessTips:3,whenToSeekHelp:3,positiveOutlook:3', {
        'Mood': currentMood, 'Stress': stressLevel, 'Feelings': feelings, 'Concerns': concerns
    }),
    fallback: {
        mentalHealth: {
            currentAssessment: ["Current mood and stress levels indicate need for attention", "Emotional well-being can be improved with support", "Professional guidance may be beneficial"],
            emotionalPatterns: ["Stress management techniques needed", "Emotional expression could be enhanced", "Coping mechanisms need development"],
            stressors: ["Work-related pressure", "Personal relationship concerns", "Life changes and transitions"],
            copingStrategies: ["Practice mindfulness and meditation", "Maintain social connections", "Establish healthy daily routines"],
            wellnessTips: ["Regular exercise and physical activity", "Adequate sleep and rest", "Healthy eating and nutrition"],
            whenToSeekHelp: ["Persistent feelings of sadness or anxiety", "Difficulty coping with daily activities", "Thoughts of self-harm or suicide"],
            positiveOutlook: ["Small daily improvements lead to big changes", "Professional support is available and effective", "Recovery and growth are possible"]
        }
    }
});

module.exports = {
    analyzeCareerAI,
    analyzeEducationAI,
    analyzeFinanceAI,
    analyzeHealthAI,
    analyzeLoveAI,
    analyzeMatchingAI,
    analyzeMentalHealthAI
};
