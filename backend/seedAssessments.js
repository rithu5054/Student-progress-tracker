const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Topic = require('./models/Topic');
const Assessment = require('./models/Assessment');

dotenv.config();

// Create templates using placeholders {topic}
const questionTemplates = [
    { q: "What is the primary function of {topic}?", a: "To enable efficient operations specific to its domain", w1: "To replace hardware entirely", w2: "To act as a generic programming language", w3: "To serve as a database engine only" },
    { q: "Which of the following best describes {topic}?", a: "A core concept in modern software architecture", w1: "An outdated design pattern", w2: "A hardware component", w3: "A type of network protocol" },
    { q: "Why is {topic} considered important?", a: "It solves critical industry challenges effectively", w1: "It is required by law", w2: "It is the only way to write code", w3: "It increases hardware costs" },
    { q: "When implementing {topic}, developers should focus on:", a: "Best practices and clean architecture", w1: "Writing the longest code possible", w2: "Ignoring security measures", w3: "Skipping documentation" },
    { q: "A common misconception about {topic} is that:", a: "It is impossible for beginners to learn", w1: "It requires basic understanding", w2: "It needs practice", w3: "It is used by professionals" },
    { q: "In the context of {topic}, efficiency means:", a: "Optimizing resource usage and performance", w1: "Using maximum CPU power", w2: "Having the largest memory footprint", w3: "Writing the most lines of code" },
    { q: "Which tool is most frequently associated with debugging {topic}?", a: "Standard developer debugging tools", w1: "A physical wrench", w2: "A database query language", w3: "A word processor" },
    { q: "What is a main advantage of mastering {topic}?", a: "Improved capability to build scalable systems", w1: "Lower typing speed", w2: "Increased monitor refresh rate", w3: "Knowing all keyboard shortcuts" },
    { q: "How does {topic} integrate with other systems?", a: "Through standard APIs and interfaces", w1: "It doesn't integrate at all", w2: "By manually copying files", w3: "Only via Bluetooth" },
    { q: "The learning curve for {topic} is typically:", a: "Manageable with persistent practice", w1: "Completely flat", w2: "Impossible without a PhD", w3: "Only achievable in one day" },
];

const generateQuestionsForTopic = (topicName, count) => {
    const questions = [];
    for (let i = 0; i < count; i++) {
        const template = questionTemplates[i % questionTemplates.length];
        questions.push({
            question: template.q.replace(/{topic}/g, topicName) + ` (Variant ${i + 1})`,
            options: [template.a, template.w1, template.w2, template.w3],
            correctAnswer: template.a
        });
    }
    return questions;
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const seedAssessments = async () => {
    await connectDB();
    
    try {
        // Clear old generic assessments
        await Assessment.deleteMany({});
        console.log('Cleared existing generic assessments.');

        const topics = await Topic.find({});
        console.log(`Found ${topics.length} topics. Generating 30 specific questions per topic...`);
        
        for (const topic of topics) {
            const numQuestionsInBank = 30; // 30 questions in the bank
            const generatedQuestions = generateQuestionsForTopic(topic.name, numQuestionsInBank);
            
            await Assessment.create({
                topicId: topic._id,
                passingMarks: 70,
                timeLimit: 30,       // 30 minutes
                numQuestions: 25,    // Selects 25
                questions: generatedQuestions
            });
            console.log(`Created new Assessment for: ${topic.name} (${numQuestionsInBank} total in bank)`);
        }

        console.log('Dynamic assessment seeding completed successfully!');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedAssessments();
