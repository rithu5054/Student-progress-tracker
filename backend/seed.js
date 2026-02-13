const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const StudyMaterial = require('./models/StudyMaterial');
const Progress = require('./models/Progress');
const bcrypt = require('bcryptjs');

dotenv.config();

const users = [
    { username: 'sarah', password: 'password123', name: 'Sarah', role: 'staff' },
    { username: 'john', password: 'john123', name: 'John', role: 'staff' },
    { username: 'alex', password: 'alex123', name: 'Alex', role: 'student' },
    { username: 'riya', password: 'riya123', name: 'Riya', role: 'student' },
    { username: 'rohan', password: 'rohan123', name: 'Rohan', role: 'student' },
    { username: 'sara', password: 'sara123', name: 'Sara', role: 'student' },
    { username: 'david', password: 'david123', name: 'David', role: 'student' },
];

const subjectsData = [
    { name: 'Full Stack Development', code: 'CS301' },
    { name: 'Data Structures & Algorithms', code: 'CS204' },
    { name: 'Database Management Systems', code: 'CS305' },
];

const topicsData = {
    'Full Stack Development': [
        'React Fundamentals',
        'Node.js & Express',
        'MongoDB Schema Design',
        'State Management with Redux',
        'Authentication with JWT'
    ],
    'Data Structures & Algorithms': [
        'Arrays & Strings',
        'Linked Lists',
        'Trees & Graphs',
        'Dynamic Programming',
        'Sorting Algorithms'
    ],
    'Database Management Systems': [
        'Relational Model',
        'SQL Basics',
        'Normalization',
        'Indexing',
        'NoSQL Databases'
    ]
};

const materialsData = [
    { title: 'Official Documentation', type: 'link', url: 'https://react.dev' },
    { title: 'Lecture Slides - Week 1', type: 'pdf', url: 'https://example.com/slides1.pdf' },
    { title: 'Practice Problem Set', type: 'pdf', url: 'https://example.com/problems.pdf' },
    { title: 'Tutorial Video', type: 'link', url: 'https://youtube.com/watch?v=example' },
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await Subject.deleteMany({});
        await Topic.deleteMany({});
        await StudyMaterial.deleteMany({});
        await Progress.deleteMany({});
        // Clear users for a fresh start with new names
        await User.deleteMany({});

        console.log('Data cleared (including users)...');

        // Create all users from the array
        const createdUsers = [];
        let staffUser = null;

        for (const u of users) {
            let user = await User.findOne({ username: u.username });
            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                user = await User.create({
                    username: u.username,
                    password: hashedPassword,
                    name: u.name,
                    role: u.role
                });
                console.log(`Created User: ${u.username} (${u.role})`);
            }
            createdUsers.push(user);
            if (u.username === 'sarah') staffUser = user;
        }

        // Filter students for enrollment
        const students = createdUsers.filter(u => u.role === 'student');

        // Also fetch the 'student' user created earlier if it exists
        const oldStudent = await User.findOne({ username: 'student' });
        if (oldStudent) students.push(oldStudent);

        // Create Subjects
        for (const subData of subjectsData) {
            const subject = await Subject.create({
                name: subData.name,
                code: subData.code,
                staffId: staffUser._id,
                students: students.map(s => s._id) // Enroll all students
            });
            console.log(`Created Subject: ${subject.name}`);

            // Create Topics
            const topicNames = topicsData[subject.name];
            const createdTopics = [];

            for (let i = 0; i < topicNames.length; i++) {
                const topicName = topicNames[i];
                const topic = await Topic.create({
                    name: topicName,
                    subjectId: subject._id,
                    order: i, // Sequential order for roadmap
                    isAssessmentAvailable: true // Enable assessments
                });
                createdTopics.push(topic);

                // Create Materials for Topic
                // Randomly add 1-3 materials
                const numMaterials = Math.floor(Math.random() * 3) + 1;
                for (let j = 0; j < numMaterials; j++) {
                    const matData = materialsData[Math.floor(Math.random() * materialsData.length)];
                    await StudyMaterial.create({
                        topicId: topic._id,
                        title: `${matData.title} (${topic.name})`,
                        type: matData.type,
                        url: matData.url
                    });
                }

                // Create Progress for Students
                for (const student of students) {
                    // Random progress for demo
                    const completion = Math.floor(Math.random() * 101);
                    let confidence = 'Low';
                    if (completion > 40) confidence = 'Medium';
                    if (completion > 80) confidence = 'High';

                    await Progress.create({
                        studentId: student._id,
                        topicId: topic._id,
                        completionPercentage: completion,
                        confidenceLevel: confidence,
                        isUnlocked: i === 0 // Only unlock first topic
                    });
                }
            }
        }

        console.log('Database Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
