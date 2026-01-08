'use strict';
const { faker } = require('@faker-js/faker');

function createRandomPrompt(createdByUserId) {
  const createdAt = faker.date.past({ years: 0.5 });
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
  return {
    id: faker.string.uuid(),
    topic: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    state: faker.helpers.arrayElement(['draft', 'pending_approval', 'posted']),
    notes: faker.lorem.sentence(),
    createdByUserId: createdByUserId,
    createdAt: createdAt,
    updatedAt: updatedAt,
  };
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {    
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" WHERE role = \'user\' LIMIT 3'
    ); // First three non-admin users
    const userIds = users[0].map(user => user.id);

    const predefinedPrompts = [ // First user
      {
        id: faker.string.uuid(),
        topic: 'Generating API Documentation',
        content: 'Create documentation for this API endpoint: Endpoint: [HTTP method] [path] Purpose: [brief description] Request parameters: [list parameters] Authentication: [requirements] Response format: [description] Please format the documentation with: Clear and concise descriptions JSON-formatted request and response examples Common error scenarios Markdown formatting',
        state: 'posted',
        notes: 'Keeping documentation current is simpler if you integrate this prompt-driven process directly into your development workflow, generating or updating documentation whenever your API endpoints evolve.',
        createdByUserId: userIds[0],
        createdAt: new Date(2025, 9, 15),
        updatedAt: new Date(2025, 9, 20),
      },
      {
        id: faker.string.uuid(),
        topic: 'The System Blueprint Architect',
        content: 'You are a senior software architect specializing in scalable system design for startups and growing companies.  Project Context: - Current application: [DESCRIBE YOUR MVP/PRODUCT] - Expected user growth: [CURRENT USERS → TARGET USERS IN 12-24 MONTHS] - Core functionality: [KEY FEATURES AND USER ACTIONS] - Technology stack: [CURRENT LANGUAGES, FRAMEWORKS, DATABASES] - Budget constraints: [DEVELOPMENT BUDGET, INFRASTRUCTURE COSTS] - Team size: [NUMBER OF DEVELOPERS, EXPERIENCE LEVEL]  Please design a scalable architecture that addresses: 1. System components and their relationships (e.g., microservices vs. monolith decision) 2. Database strategy (scaling, partitioning, caching layers) 3. API design for future integrations and mobile apps 4. Infrastructure recommendations (cloud services, CDN, load balancing) 5. Security considerations at scale 6. Monitoring and observability setup 7. Deployment and CI/CD pipeline structure 8. Cost optimization strategies for each growth phase  Provide a step-by-step plan outlining what to implement immediately and what to defer. Include specific technology recommendations with reasoning.',
        state: 'pending_approval',
        notes: 'There are real-world examples of how this approach works. Jerrik Arango, Principal Software Engineer at HatchWorks, successfully scaled a local event finder MVP by leveraging AI tools not just for coding but for designing the system architecture itself. He used platforms like Amplication for containerizing with Docker, Prisma ORM for efficient data management, and Mermaid for creating clear, visual architecture diagrams.',
        createdByUserId: userIds[0],
        createdAt: new Date(2025, 10, 5),
        updatedAt: new Date(2025, 10, 6),
      },
      {
        id: faker.string.uuid(),
        topic: 'The Step-by-Step Code Detective for Debugging',
        content: 'You are an expert debugger helping me solve an issue.  Problem Context: - Language: [YOUR PROGRAMMING LANGUAGE] - Expected behavior: [WHAT SHOULD HAPPEN] - Actual behavior: [WHAT IS HAPPENING INSTEAD] - Error messages (if any): [PASTE ERROR OR "NONE"]  Here is my code: [PASTE YOUR CODE HERE]  Please: 1. Walk through this function line by line 2. Track the value of each variable at each step 3. Identify where the logic breaks down 4. Explain why the bug occurs 5. Provide a corrected version with explanation  Use a "rubber duck debugging" approach - simulate the debugging process using print statements. ',
        state: 'posted',
        notes: 'This prompt is designed to streamline the debugging process, especially for tricky logic issues where no clear error message is present, but the output is wrong. It works best when you provide detailed and specific context. For instance, instead of asking something vague like, "Why isn’t my function working?", try framing your problem like this: I have a function in JavaScript that’s supposed to calculate the sum of an array of numbers, but it keeps returning NaN (Not a Number) instead of the actual sum. Here is the code: [include code]. For an input like [1, 2, 3], it should return 6, but I am getting NaN. Can you help me figure out why?',
        createdByUserId: userIds[0],
        createdAt: new Date(2025, 11, 10),
        updatedAt: new Date(2025, 11, 15),
      },
      // Second user
      {
        id: faker.string.uuid(),
        topic: 'The MVP Boilerplate Generator',
        content: 'The Copy-Paste Prompt: You are an expert full-stack developer building an MVP for [DESCRIBE YOUR PRODUCT].  Tech Stack: [LIST YOUR TECHNOLOGIES] Key Features: [LIST 3-5 CORE FEATURES] User Types: [DESCRIBE YOUR USERS] Third-party Integrations: [LIST ANY APIs OR SERVICES]  Generate the following: 1. Project folder structure 2. Database schema with relationships 3. API endpoints for core features 4. Authentication system with JWT 5. Frontend components for main user flows 6. Error handling and validation 7. Basic unit tests  Requirements: - Follow [FRAMEWORK] best practices - Include proper error handling - Add input validation - Make code modular and reusable - Include comments explaining key logic - Optimize for performance and scalability  Output each section separately with clear labels.',
        state: 'posted',
        notes: 'For example, a startup managed to deploy a fully functional B2B SaaS dashboard in just 48 hours by combining ChatGPT, GitHub Copilot, and Claude. Using this prompt, they generated a Tailwind CSS interface, REST APIs, and a JWT-based authentication system – all in record time.',
        createdByUserId: userIds[1],
        createdAt: new Date(2025, 11, 20),
        updatedAt: new Date(2025, 11, 22),
      },
      {
        id: faker.string.uuid(),
        topic: 'Deciding between GraphQL and REST for a new API',
        content: 'Back when I was deciding between GraphQL and REST for our new API, I realized that generic advice wasn’t cutting it. I needed a balanced assessment of both approaches for our specific situation. That’s when I started using the pros and cons strategy, and it’s been my go-to for technical decisions ever since.',
        state: 'pending_approval',
        notes: null,
        createdByUserId: userIds[1],
        createdAt: new Date(2026, 0, 2),
        updatedAt: new Date(2026, 0, 3),
      },
      // Third user
      {
        id: faker.string.uuid(),
        topic: 'Q&A Prompt Strategy',
        content: 'I stumbled upon this technique after getting burned by half-baked solutions that missed critical requirements. Instead of the AI rushing to give you an answer, you force it to ask clarifying questions first.',
        state: 'posted',
        notes: 'Would like to hear other opinions, especially from QA testers',
        createdByUserId: userIds[2],
        createdAt: new Date(2026, 0, 5),
        updatedAt: new Date(2026, 0, 6),
      },
    ];

    const randomPrompts = Array.from({ length: 10 }, () => createRandomPrompt(faker.helpers.arrayElement(userIds)));
    const prompts = [...predefinedPrompts, ...randomPrompts];

    await queryInterface.bulkInsert('Prompts', prompts, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Prompts', null, {});
  }
};
